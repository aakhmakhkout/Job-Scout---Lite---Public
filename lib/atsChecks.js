// Update 49 — Resume Intelligence, step 2 of the roadmap tracked in
// updates.md. Everything here is a rule-based heuristic — regex,
// word-list lookups, and (for DOCX) direct inspection of the file's
// own zip structure. No AI/LLM anywhere in this file, same as step 1.
//
// This step deliberately checks presence and mechanics only — whether
// a Skills section exists, whether bullets read well, whether the
// file itself is something an ATS can parse cleanly. It does NOT
// check section *order* (that's step 3) and does NOT produce a single
// overall score or plain-English tips list yet (that's step 4, which
// turns this step's raw findings into the actual report a user reads).
import AdmZip from 'adm-zip';
import { startsWithActionVerb } from './actionVerbsDictionary';

const SECTION_PATTERNS = {
  hasSummary: /\b(summary|professional summary|profile|objective)\b/i,
  hasSkills: /\b(skills|technical skills|core competencies)\b/i,
  hasExperience: /\b(experience|work experience|employment history|professional experience)\b/i,
  hasEducation: /\beducation\b/i,
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

// Checks each SECTION_PATTERNS entry against the text on its own
// line (a real header, "Skills" on its own line) OR anywhere in text
// as a fallback — resumes vary too much in formatting to require a
// standalone-line match strictly, but a standalone-line hit is a
// stronger signal so it's tracked separately for step 3 to reuse.
function checkSections(text) {
  const lines = text.split('\n');
  const result = {};
  for (const [key, pattern] of Object.entries(SECTION_PATTERNS)) {
    const onOwnLine = lines.some((line) => {
      const trimmed = line.trim();
      return trimmed.length < 40 && pattern.test(trimmed);
    });
    result[key] = onOwnLine || pattern.test(text);
  }
  return result;
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
  return {
    wordCount: checkWordCount(text),
    sections: checkSections(text),
    contactInfo: checkContactInfo(text),
    bullets: checkBullets(text),
    structure:
      fileType === 'docx' ? checkDocxStructure(buffer) : checkPdfStructure(numPages),
  };
}
