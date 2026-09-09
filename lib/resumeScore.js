// Update 52 — Resume Intelligence, step 4 of the roadmap tracked in
// updates.md. This is the step that finally turns steps 2 and 3's raw
// findings into something that reads like an actual report: one
// score, and a plain-English, priority-ordered list of what to fix.
// Still zero AI — this is just a weighted checklist and some
// if/else-driven sentence templates, same rule-based approach as
// every other file in this feature.
//
// Deliberately does NOT factor in step 1 (skills) — skills are about
// whether you're a fit for a particular job, not whether your resume
// itself is well put-together, which is what this score measures.
// Also does not factor in step 5 (job matching), which doesn't exist
// yet.

// Points available per check, and how they're split when a check only
// partially passes (e.g. "9 of 10 bullets are action-verb-led" isn't
// simply pass/fail). Structure checks (tables/images/text boxes) are
// DOCX-only — see lib/atsChecks.js's checkPdfStructure comment for
// why — so a PDF's score is calculated out of a smaller total on
// purpose, then normalized to 100, rather than unfairly docking every
// PDF resume 10 points for a check that was never actually run
// against it.
const WEIGHTS = {
  wordCount: 10,
  hasEmail: 8,
  hasPhone: 7,
  hasSummary: 8,
  hasSkills: 12,
  hasExperience: 15,
  hasEducation: 10,
  bullets: 15,
  sectionOrder: 10,
  structure: 5,
};

function scoreLabel(score) {
  if (score >= 90) return 'Strong';
  if (score >= 75) return 'Good';
  if (score >= 60) return 'Needs some work';
  return 'Needs significant work';
}

// Returns { score: 0-100, label, tips: [string, ...] } — tips are
// ordered roughly by impact: missing contact info and core sections
// first (the things most likely to get a resume auto-rejected or
// skipped), formatting/structure next, then section order, bullets,
// and word count last (real, but lower-stakes polish).
export function scoreResume(atsChecks) {
  if (!atsChecks) return null;

  const { wordCount, sections, sectionOrder, contactInfo, bullets, structure } = atsChecks;
  let earned = 0;
  let possible = 0;
  const tips = [];

  // Contact info — highest priority; a reviewer or an ATS that can't
  // find a way to reach you makes everything else moot.
  possible += WEIGHTS.hasEmail;
  if (contactInfo.hasEmail) earned += WEIGHTS.hasEmail;
  else tips.push("We couldn't find an email address — make sure it's plain text, not inside an image or icon-only contact block.");

  possible += WEIGHTS.hasPhone;
  if (contactInfo.hasPhone) earned += WEIGHTS.hasPhone;
  else tips.push("We couldn't find a phone number — same idea, make sure it's plain text.");

  // Core sections — Experience and Skills weighted highest since
  // they're what most ATS keyword-scans and human skimmers look for
  // first; Education and Summary matter but carry a bit less weight.
  possible += WEIGHTS.hasExperience;
  if (sections.hasExperience) earned += WEIGHTS.hasExperience;
  else tips.push('No Experience section found — this is one of the most important sections on a resume.');

  possible += WEIGHTS.hasSkills;
  if (sections.hasSkills) earned += WEIGHTS.hasSkills;
  else tips.push('Add a dedicated Skills section — many ATS systems specifically scan for one.');

  possible += WEIGHTS.hasEducation;
  if (sections.hasEducation) earned += WEIGHTS.hasEducation;
  else tips.push('No Education section found.');

  possible += WEIGHTS.hasSummary;
  if (sections.hasSummary) earned += WEIGHTS.hasSummary;
  else tips.push('Consider adding a short Summary or Objective near the top — it gives a reviewer context before the details.');

  // Structure — DOCX only. A PDF's `possible` total simply never
  // includes this, rather than scoring it as an automatic fail.
  if (structure.checked) {
    possible += WEIGHTS.structure;
    const structureIssues = [];
    if (structure.hasTables) structureIssues.push('tables');
    if (structure.hasTextBoxes) structureIssues.push('text boxes');
    if (structureIssues.length === 0) {
      // Neither tables nor text boxes — full credit. An image alone
      // (checked separately below) doesn't block full credit here;
      // see checkDocxStructure's comment for why it's treated as
      // lower-stakes than the other two.
      earned += WEIGHTS.structure;
      if (structure.hasImages) {
        tips.push('Your file includes an image — usually harmless, but it adds nothing an ATS can actually read.');
      }
    } else {
      tips.push(
        `Your file uses ${structureIssues.join(' and ')} — ${
          structureIssues.includes('text boxes')
            ? 'content inside a text box often never reaches an ATS parser at all'
            : 'some ATS parsers misread or skip table content entirely'
        }. Consider moving that content into the main body text instead.`
      );
    }
  }

  // Section order — only scored when there was enough to meaningfully
  // check (checkSectionOrder itself returns matchesRecommended: null
  // when fewer than 2 sections were found on their own header line;
  // that null is treated the same as "not applicable," same pattern
  // as the structure check above).
  if (sectionOrder && sectionOrder.matchesRecommended !== null) {
    possible += WEIGHTS.sectionOrder;
    if (sectionOrder.matchesRecommended) {
      earned += WEIGHTS.sectionOrder;
    } else {
      tips.push(
        `Your section order (${sectionOrder.detectedOrder.join(' → ')}) doesn't quite match the common convention (${sectionOrder.recommendedOrder.join(' → ')}) — worth double-checking it reads naturally top to bottom.`
      );
    }
  }

  // Bullets — partial credit proportional to the action-verb ratio,
  // not binary pass/fail, since "7 of 10" is a meaningfully different
  // (and more actionable) result than a flat fail.
  possible += WEIGHTS.bullets;
  if (bullets.total === 0) {
    tips.push("We didn't detect any bullet points — bullets are usually easier to skim than paragraphs for describing your experience.");
  } else {
    const ratio = bullets.actionVerbCount / bullets.total;
    earned += Math.round(WEIGHTS.bullets * ratio);
    if (ratio < 0.6) {
      tips.push(
        `Only ${bullets.actionVerbCount} of ${bullets.total} bullet points start with a strong action verb (like "Led," "Built," "Reduced") — try rewriting weaker openers like "Responsible for..." to lead with what you actually did.`
      );
    }
  }

  // Word count — real, but the lowest-stakes item here, so it's last.
  possible += WEIGHTS.wordCount;
  if (wordCount.status === 'ok') {
    earned += WEIGHTS.wordCount;
  } else if (wordCount.status === 'too-short') {
    tips.push(`Your resume is on the shorter side (${wordCount.count} words) — most run 400–800 words. Consider adding more detail to your experience bullets.`);
  } else {
    tips.push(`Your resume runs long (${wordCount.count} words) — most stay under about 1200. Consider trimming older or less relevant experience.`);
  }

  const score = possible > 0 ? Math.round((earned / possible) * 100) : null;

  return {
    score,
    label: score === null ? null : scoreLabel(score),
    tips,
  };
}
