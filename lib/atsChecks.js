// Update 49 — Resume Intelligence, step 2 of the roadmap tracked in
// updates.md. Everything here is a rule-based heuristic — regex,
// word-list lookups, and (for DOCX) direct inspection of the file's
// own zip structure. No AI/LLM anywhere in this file, same as step 1.
//
// Update 51 — step 3 added section-*order* checking (checkSectionOrder
// below) on top of step 2's section-*presence* checking. Still no
// single overall score or plain-English tips list — that's step 4,
// which combines this step's raw findings (plus step 2's) into the
// actual report a user reads.
import AdmZip from 'adm-zip';
import { startsWithActionVerb } from './actionVerbsDictionary';

const SECTION_PATTERNS = {
  hasSummary: /\b(summary|professional summary|profile|objective)\b/i,
  hasSkills: /\b(skills|technical skills|core competencies)\b/i,
  hasExperience: /\b(experience|work experience|employment history|professional experience)\b/i,
  hasEducation: /\beducation\b/i,
};

// The order this project recommends, and the labels shown in the UI
// for it. This is a common convention for the kind of early-to-mid-
// career, tech-leaning resumes this project's job sources actually
// carry — NOT a rule any real ATS parser enforces. Worth saying
// plainly: most ATS software just looks for section headers as
// anchors: it doesn't care what order they're in. This check exists
// because order matters for the *human* skimming a resume in the 10
// seconds before deciding whether to keep reading, not for the
// software before that human ever sees it.
const RECOMMENDED_SECTION_ORDER = ['hasSummary', 'hasSkills', 'hasExperience', 'hasEducation'];
const SECTION_LABELS = {
  hasSummary: 'Summary',
  hasSkills: 'Skills',
  hasExperience: 'Experience',
  hasEducation: 'Education',
};

const EMAIL_PATTERN = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;
// Deliberately loose — resumes format phone numbers wildly
// differently (dashes, dots, spaces, parens, country codes). This
// looks for "7+ digits with light separators in between" rather than
// a strict format, to avoid false negatives on real, valid numbers.
const PHONE_PATTERN = /(\+?\d[\d\s().-]{7,}\d)/;

const BULLET_LINE_PATTERN = /^\s*[•●▪◦‣∙*\-–—]\s*\S/;
const LEADING_BULLET_CHAR = /^\s*[•●▪◦‣∙*\-–—]\s*/;

function checkWordCount(text) {
  const count = (text.match(/\S+/g) || []).length;
  let status = 'ok';
  if (count < 150) status = 'too-short';
  else if (count > 1200) status = 'too-long';
  return { count, status };
}

// Finds the line index of each section's FIRST standalone-line match
// (a real header — "Skills" alone on its own short line — is a much
// stronger signal than the word merely appearing somewhere in a
// sentence). Returns { [sectionKey]: lineIndex, ... } — a key is
// simply absent if no standalone-line match was found. Shared by both
// checkSections (presence) and checkSectionOrder (order), so a
// section only counts toward order-checking when it was found with
// this same, stronger signal presence already uses internally.
function findSectionHeaderLines(text) {
  const lines = text.split('\n');
  const positions = {};
  for (const [key, pattern] of Object.entries(SECTION_PATTERNS)) {
    const idx = lines.findIndex((line) => {
      const trimmed = line.trim();
      return trimmed.length < 40 && pattern.test(trimmed);
    });
    if (idx !== -1) positions[key] = idx;
  }
  return positions;
}

// Presence check (step 2) — a standalone-line match OR, failing that,
// the word appearing anywhere in the text at all. Resumes vary too
// much in formatting to require a standalone-line match strictly for
// *presence*, but order-checking (step 3, below) is stricter on
// purpose — see checkSectionOrder.
function checkSections(text, headerLines) {
  const result = {};
  for (const [key, pattern] of Object.entries(SECTION_PATTERNS)) {
    result[key] = headerLines[key] !== undefined || pattern.test(text);
  }
  return result;
}

// Order check (step 3) — unlike presence, this ONLY considers sections
// found as a real standalone-line header (headerLines). A section that
// only ever appears mid-sentence has no meaningful "position" to
// compare against anything else, so it's excluded here even though
// step 2 might still count it as present.
function checkSectionOrder(headerLines) {
  const foundKeys = RECOMMENDED_SECTION_ORDER.filter((key) => headerLines[key] !== undefined);
  const detectedOrder = [...foundKeys].sort((a, b) => headerLines[a] - headerLines[b]);

  // Only checks ADJACENT pairs in the resume's actual order, not
  // every possible pair — a fully-reversed 4-section resume has 6
  // possible pairwise inversions but really only 3 genuine "these two
  // are swapped" problems; reporting all 6 would just be noise
  // repeating the same underlying issue from different angles.
  const issues = [];
  for (let i = 0; i < detectedOrder.length - 1; i++) {
    const earlier = detectedOrder[i];
    const later = detectedOrder[i + 1];
    if (RECOMMENDED_SECTION_ORDER.indexOf(earlier) > RECOMMENDED_SECTION_ORDER.indexOf(later)) {
      issues.push(
        `${SECTION_LABELS[earlier]} appears before ${SECTION_LABELS[later]} — usually the other way round`
      );
    }
  }

  return {
    detectedOrder: detectedOrder.map((key) => SECTION_LABELS[key]),
    recommendedOrder: RECOMMENDED_SECTION_ORDER.map((key) => SECTION_LABELS[key]),
    matchesRecommended: detectedOrder.length >= 2 ? issues.length === 0 : null,
    issues,
  };
}

function checkContactInfo(text) {
  return {
    hasEmail: EMAIL_PATTERN.test(text),
    hasPhone: PHONE_PATTERN.test(text),
  };
}

function checkBullets(text) {
  const bulletLines = text.split('\n').filter((line) => BULLET_LINE_PATTERN.test(line));
  const actionVerbCount = bulletLines.filter((line) =>
    startsWithActionVerb(line.replace(LEADING_BULLET_CHAR, ''))
  ).length;
  return { total: bulletLines.length, actionVerbCount };
}

// DOCX only — a .docx file IS a zip archive, so this inspects it
// directly rather than relying on mammoth's plain-text output (which
// has already thrown away exactly the structural info this needs).
//   - hasTables: real ATS parsers frequently mis-read or skip content
//     inside Word tables entirely — a two-column "skills table" can
//     vanish completely for some parsers.
//   - hasImages: a profile photo or graphic in word/media/ — mostly
//     harmless for humans, but adds nothing an ATS can read and some
//     parsers choke on the surrounding layout.
//   - hasTextBoxes: content inside a text box literally doesn't reach
//     mammoth's extractRawText() at all (a known mammoth limitation,
//     confirmed by checking for w:txbxContent directly) — which means
//     it doesn't reach an ATS either. If someone's contact info is
//     sitting in a text box header, it's invisible to both.
function checkDocxStructure(buffer) {
  try {
    const zip = new AdmZip(buffer);
    const mediaEntries = zip.getEntries().filter((e) => e.entryName.startsWith('word/media/'));
    const documentXmlEntry = zip.getEntry('word/document.xml');
    const documentXml = documentXmlEntry ? documentXmlEntry.getData().toString('utf8') : '';

    return {
      hasTables: documentXml.includes('<w:tbl'),
      hasImages: mediaEntries.length > 0,
      hasTextBoxes: documentXml.includes('w:txbxContent'),
      checked: true,
    };
  } catch (err) {
    console.error('checkDocxStructure: could not inspect .docx internals', err);
    // Fails open to "nothing detected" rather than blocking the whole
    // upload over a structural check that's secondary to actually
    // getting the resume's text and skills saved.
    return { hasTables: false, hasImages: false, hasTextBoxes: false, checked: false };
  }
}

// PDF — deliberately limited. pdf-parse's default output is plain
// text with no layout/position data, so reliably detecting tables,
// multi-column layouts, or embedded images in a PDF isn't something
// this step attempts — that would need direct access to pdf.js's
// per-character position data, a meaningfully bigger piece of work
// than this step's scope. Page count is the one structural signal
// pdf-parse gives for free, so that's what this checks: most
// individual-contributor resumes run 1–2 pages, and 3+ is at least
// worth a flag (not a hard failure — some genuinely need more).
function checkPdfStructure(numPages) {
  return {
    hasTables: null,
    hasImages: null,
    hasTextBoxes: null,
    pageCount: numPages,
    checked: false,
  };
}

// Combines every check above into one result object. `text` is
// required; `fileType`/`buffer`/`numPages` come straight from
// parseResumeFile()'s return value.
export function runAtsChecks({ text, fileType, buffer, numPages }) {
  const headerLines = findSectionHeaderLines(text);
  return {
    wordCount: checkWordCount(text),
    sections: checkSections(text, headerLines),
    sectionOrder: checkSectionOrder(headerLines),
    contactInfo: checkContactInfo(text),
    bullets: checkBullets(text),
    structure:
      fileType === 'docx' ? checkDocxStructure(buffer) : checkPdfStructure(numPages),
  };
}
