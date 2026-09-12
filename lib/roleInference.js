// Update 56 — Career Roadmap, sub-step 1 of its own mini-roadmap
// (tracked in updates.md, under "Career Roadmap — feature roadmap").
// This is step 8 of the original Resume Intelligence plan, grown into
// its own multi-part feature given the scope of what was actually
// asked for — see updates.md for the full breakdown.
//
// Maps a resume's extracted skills (lib/skillsDictionary.js, step 1)
// to one or more likely roles — Frontend, Backend, Data & ML, DevOps &
// Cloud, Mobile — using the same rule-based keyword-overlap approach
// as everywhere else in this feature. No AI, no external calls.
//
// Deliberately doesn't try to special-case "Full Stack" as its own
// signal set — a resume with strong signal in both Frontend and
// Backend already surfaces as two roles clearing the threshold, which
// the UI shows as a picker. That IS what "full stack" looks like from
// a skills-overlap perspective; no separate merge logic needed to get
// there.
const ROLE_SIGNALS = {
  Frontend: [
    'JavaScript', 'TypeScript', 'React', 'Next.js', 'Vue.js', 'Angular',
    'Svelte', 'HTML/CSS', 'Tailwind CSS', 'Sass/SCSS', 'Redux', 'jQuery',
    'Webpack', 'Vite', 'Figma', 'UI/UX Design',
  ],
  Backend: [
    'Node.js', 'Express.js', 'Django', 'Flask', 'FastAPI', 'Ruby on Rails',
    'Spring Boot', '.NET', 'Laravel', 'GraphQL', 'REST APIs', 'gRPC',
    'Microservices', 'Python', 'Java', 'PHP', 'Go', 'Ruby', 'C#',
    'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'SQL',
  ],
  'Data & ML': [
    'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Pandas',
    'NumPy', 'Data Analysis', 'Data Engineering', 'ETL', 'Apache Spark',
    'Tableau', 'Power BI', 'NLP', 'Computer Vision', 'SQL', 'Python', 'R',
  ],
  'DevOps & Cloud': [
    'AWS', 'Google Cloud (GCP)', 'Azure', 'Docker', 'Kubernetes',
    'Terraform', 'CI/CD', 'Jenkins', 'GitHub Actions', 'Ansible', 'Nginx',
    'Linux',
  ],
  Mobile: [
    'React Native', 'Flutter', 'iOS Development', 'Android Development',
    'Swift', 'Kotlin', 'Dart',
  ],
};

// A role needs at least this many matched signal skills to be
// considered a real candidate at all — same reasoning as
// lib/resumeJobMatching.js's MIN_STRONG_MATCH_SKILLS: a resume that
// happens to mention SQL once shouldn't get flagged as a "Data & ML"
// candidate on that alone.
const MIN_ROLE_SKILLS = 3;

// A second role only makes it into the results if its score comes
// within this fraction of the top role's score — otherwise a resume
// that's overwhelmingly Frontend with one incidental Python mention
// would show a "Frontend or Data & ML?" picker that's obviously not a
// real choice. 0.5 means a role needs at least half the top role's
// matched-skill count to count as a genuine second option.
const SECONDARY_ROLE_THRESHOLD = 0.5;

// Returns { roles, primaryRole, isSingleRole }:
//   - roles: every role that cleared MIN_ROLE_SKILLS, sorted by
//     matched-skill count desc, each as { role, matchedSkills, score }
//   - primaryRole: the top-scoring role's name, or null if none
//     cleared the minimum
//   - isSingleRole: true when exactly one role is a genuine
//     candidate (either only one cleared MIN_ROLE_SKILLS at all, or a
//     second role existed but didn't come close enough to the top
//     score to count as a real second option) — the UI uses this to
//     decide "go straight to the roadmap" vs. "show a picker"
export function inferRoles(resumeSkills) {
  if (!resumeSkills || resumeSkills.length === 0) {
    return { roles: [], primaryRole: null, isSingleRole: false };
  }

  const skillSet = new Set(resumeSkills);

  const scored = Object.entries(ROLE_SIGNALS)
    .map(([role, signals]) => {
      const matchedSkills = signals.filter((skill) => skillSet.has(skill));
      return { role, matchedSkills, score: matchedSkills.length };
    })
    .filter((r) => r.score >= MIN_ROLE_SKILLS)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) {
    return { roles: [], primaryRole: null, isSingleRole: false };
  }

  const topScore = scored[0].score;
  const roles = scored.filter((r) => r.score >= topScore * SECONDARY_ROLE_THRESHOLD);

  return {
    roles,
    primaryRole: roles[0].role,
    isSingleRole: roles.length === 1,
  };
}

export const ROLE_NAMES = Object.keys(ROLE_SIGNALS);
