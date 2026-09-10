// Update 53 — Resume Intelligence, step 5 of the roadmap tracked in
// updates.md. Matches a resume's extracted skills (step 1) against
// the live job cache using plain keyword overlap — the same rule-
// based approach as every other file in this feature, no AI. This is
// classic information-retrieval math (count the intersection of two
// keyword sets), not a model call.
//
// Deliberately does NOT build a separate "domain" taxonomy for the
// "closest jobs when nothing matches well" fallback the roadmap asks
// for — nothing in this project's job data has a domain/category
// field to classify against (see scraper/job_classify.py: the only
// classification that exists is Job vs. Internship). Instead, the
// fallback is a natural byproduct of the same ranking: sorting every
// job by skill-overlap score and taking the top N works whether the
// top score is high (a strong match) or low (the closest thing
// available) — no second code path needed, just different framing in
// the UI depending on whether the top result clears a "real match"
// threshold.
import { extractSkillsFromText } from './skillsDictionary';

// A job needs at least this many overlapping skills to count as a
// genuine match rather than the "nothing matched well, here's the
// closest thing" fallback. Chosen deliberately low — most job
// postings mention only a handful of specific technologies even when
// they're a great fit, so requiring more than 2 would filter out
// perfectly good matches.
const MIN_STRONG_MATCH_SKILLS = 2;

// Red Flag and Suspicious listings are never surfaced as a resume
// match, full stop — recommending a job is a stronger endorsement
// than just listing it neutrally on the Jobs page, and this project's
// whole premise is trust scoring. A resume-matching feature that
// could recommend a scam listing would undercut that.
const EXCLUDED_TIERS = new Set(['suspicious', 'red flag']);

function isEligible(job) {
  const tier = (job.trust_tier || '').toLowerCase();
  return !EXCLUDED_TIERS.has(tier);
}

// Returns { matches, isFallback, reason }:
//   - matches: up to `limit` jobs, each as { job, matchedSkills,
//     matchScore }, sorted by matchScore desc, then trust_score desc,
//     then most recently posted
//   - isFallback: true when even the top match didn't clear
//     MIN_STRONG_MATCH_SKILLS — the UI uses this to switch from "jobs
//     matching your skills" framing to "closest matches we found"
//   - reason: 'no-skills' | 'no-jobs' | null — null means real
//     matches or a real fallback list both exist; the other two mean
//     `matches` is empty and why
export function matchJobsToResume(jobs, resumeSkills, limit = 10) {
  if (!resumeSkills || resumeSkills.length === 0) {
    return { matches: [], isFallback: true, reason: 'no-skills' };
  }

  const eligibleJobs = (jobs || []).filter(isEligible);
  if (eligibleJobs.length === 0) {
    return { matches: [], isFallback: true, reason: 'no-jobs' };
  }

  const resumeSkillSet = new Set(resumeSkills);

  const scored = eligibleJobs.map((job) => {
    const jobText = `${job.title || ''} ${job.summary || ''}`;
    const jobSkills = extractSkillsFromText(jobText);
    const matchedSkills = jobSkills.filter((skill) => resumeSkillSet.has(skill));
    return { job, matchedSkills, matchScore: matchedSkills.length };
  });

  scored.sort((a, b) => {
    if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
    const trustDiff = (b.job.trust_score ?? 0) - (a.job.trust_score ?? 0);
    if (trustDiff !== 0) return trustDiff;
    return new Date(b.job.posted_at || 0) - new Date(a.job.posted_at || 0);
  });

  const topScore = scored[0]?.matchScore ?? 0;

  return {
    matches: scored.slice(0, limit),
    isFallback: topScore < MIN_STRONG_MATCH_SKILLS,
    reason: null,
  };
}
