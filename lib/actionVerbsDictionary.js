// Update 49 — Resume Intelligence, step 2 (ATS formatting checks).
// A curated list of strong resume action verbs — used to check
// whether bullet points start with one, a genuinely common ATS/resume
// best-practice check ("Built the pipeline" reads and parses better
// than "Responsible for the pipeline"). Pure word-list lookup, same
// no-AI approach as lib/skillsDictionary.js.
export const ACTION_VERBS = [
  'achieved', 'administered', 'analyzed', 'architected', 'automated',
  'built', 'championed', 'coordinated', 'created', 'delivered',
  'designed', 'developed', 'directed', 'drove', 'engineered',
  'enhanced', 'established', 'executed', 'expanded', 'facilitated',
  'founded', 'generated', 'grew', 'implemented', 'improved',
  'increased', 'initiated', 'integrated', 'launched', 'led',
  'leveraged', 'maintained', 'managed', 'mentored', 'migrated',
  'negotiated', 'operated', 'optimized', 'orchestrated', 'organized',
  'oversaw', 'partnered', 'pioneered', 'planned', 'produced',
  'programmed', 'redesigned', 'reduced', 'refactored', 'resolved',
  'restructured', 'scaled', 'shipped', 'simplified', 'spearheaded',
  'streamlined', 'strengthened', 'supervised', 'supported',
  'transformed', 'upgraded',
];

const ACTION_VERB_SET = new Set(ACTION_VERBS);

// Checks whether the first word of a bullet-point line is a known
// action verb — handles both base form ("Built...") and the "-ed"/"-d"
// past-tense form most resumes actually use ("Built" already covers
// this since the dictionary above stores the past-tense form
// directly, matching how these verbs actually appear on a resume).
export function startsWithActionVerb(line) {
  const firstWord = (line || '')
    .trim()
    .split(/\s+/)[0]
    ?.toLowerCase()
    .replace(/[^a-z]/g, '');
  return firstWord ? ACTION_VERB_SET.has(firstWord) : false;
}
