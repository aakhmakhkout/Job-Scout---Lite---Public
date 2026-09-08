// Update 47 — Resume Intelligence, step 1 of the roadmap tracked in
// updates.md ("Resume Intelligence — feature roadmap"). Purely
// rule-based, on purpose: no AI/LLM calls anywhere in this file — just
// a curated skill list and word-boundary-safe keyword matching against
// the resume's extracted text. Same zero-cost, zero-external-API
// philosophy as the rest of this project.
//
// Each entry is { name, aliases } — `name` is the canonical form shown
// back to the user; `aliases` are the ways it might actually appear in
// a resume (abbreviations, alternate casings/spellings, the "how
// people actually type it" list). Matching checks every alias and
// reports the canonical name once, deduplicated, if any alias hits.
//
// This list is deliberately broad-but-not-exhaustive — it's tuned for
// the kind of roles this project's scraper sources actually carry
// (RemoteOK, Wellfound, Lever/Greenhouse tech postings, etc.), not a
// universal taxonomy of every possible job skill. Expanding it is a
// safe, low-risk edit any time — it's just data, no logic changes
// needed to add a new skill.
export const SKILLS = [
  // Languages
  { name: 'JavaScript', aliases: ['javascript', 'js'] },
  { name: 'TypeScript', aliases: ['typescript', 'ts'] },
  { name: 'Python', aliases: ['python'] },
  { name: 'Java', aliases: ['java'] },
  { name: 'C++', aliases: ['c++', 'cpp'] },
  { name: 'C#', aliases: ['c#', 'c sharp', 'csharp'] },
  { name: 'C', aliases: ['c programming', ' c language'] },
  // "Go" is deliberately matched via "golang" only, not a bare "go" —
  // "go" is too common an English word to safely word-boundary-match
  // without false positives ("go get coffee"). A resume that only
  // ever writes "Go" (never "Golang") won't be caught here — an
  // accepted trade-off for a keyword-only approach.
  { name: 'Go', aliases: ['golang'] },
  { name: 'Rust', aliases: ['rust'] },
  { name: 'Ruby', aliases: ['ruby'] },
  { name: 'PHP', aliases: ['php'] },
  { name: 'Swift', aliases: ['swift'] },
  { name: 'Kotlin', aliases: ['kotlin'] },
  { name: 'Scala', aliases: ['scala'] },
  { name: 'R', aliases: ['r programming', 'r language'] },
  { name: 'SQL', aliases: ['sql'] },
  { name: 'Bash/Shell', aliases: ['bash', 'shell scripting', 'shell script'] },
  { name: 'Dart', aliases: ['dart'] },
  { name: 'Perl', aliases: ['perl'] },
  { name: 'Elixir', aliases: ['elixir'] },
  { name: 'Haskell', aliases: ['haskell'] },

  // Frontend
  { name: 'React', aliases: ['react.js', 'reactjs', 'react'] },
  { name: 'Next.js', aliases: ['next.js', 'nextjs'] },
  { name: 'Vue.js', aliases: ['vue.js', 'vuejs', 'vue'] },
  { name: 'Angular', aliases: ['angular.js', 'angularjs', 'angular'] },
  { name: 'Svelte', aliases: ['svelte'] },
  { name: 'HTML/CSS', aliases: ['html', 'css', 'html5', 'css3'] },
  { name: 'Tailwind CSS', aliases: ['tailwind', 'tailwindcss'] },
  { name: 'Sass/SCSS', aliases: ['sass', 'scss'] },
  { name: 'Redux', aliases: ['redux'] },
  { name: 'jQuery', aliases: ['jquery'] },
  { name: 'Webpack', aliases: ['webpack'] },
  { name: 'Vite', aliases: ['vite'] },

  // Backend / frameworks
  { name: 'Node.js', aliases: ['node.js', 'nodejs', 'node js'] },
  { name: 'Express.js', aliases: ['express.js', 'expressjs', 'express'] },
  { name: 'Django', aliases: ['django'] },
  { name: 'Flask', aliases: ['flask'] },
  { name: 'FastAPI', aliases: ['fastapi'] },
  { name: 'Ruby on Rails', aliases: ['ruby on rails', 'rails'] },
  { name: 'Spring Boot', aliases: ['spring boot', 'spring framework'] },
  { name: '.NET', aliases: ['.net', 'dotnet', 'asp.net'] },
  { name: 'Laravel', aliases: ['laravel'] },
  { name: 'GraphQL', aliases: ['graphql'] },
  { name: 'REST APIs', aliases: ['rest api', 'restful api', 'rest apis'] },
  { name: 'gRPC', aliases: ['grpc'] },
  { name: 'Microservices', aliases: ['microservices', 'microservice architecture'] },

  // Mobile
  { name: 'React Native', aliases: ['react native'] },
  { name: 'Flutter', aliases: ['flutter'] },
  { name: 'iOS Development', aliases: ['ios development', 'ios app'] },
  { name: 'Android Development', aliases: ['android development', 'android app'] },

  // Databases
  { name: 'PostgreSQL', aliases: ['postgresql', 'postgres'] },
  { name: 'MySQL', aliases: ['mysql'] },
  { name: 'MongoDB', aliases: ['mongodb', 'mongo db'] },
  { name: 'Redis', aliases: ['redis'] },
  { name: 'SQLite', aliases: ['sqlite'] },
  { name: 'Elasticsearch', aliases: ['elasticsearch', 'elastic search'] },
  { name: 'DynamoDB', aliases: ['dynamodb'] },
  { name: 'Firebase', aliases: ['firebase'] },
  { name: 'Supabase', aliases: ['supabase'] },
  { name: 'Cassandra', aliases: ['cassandra'] },

  // Cloud / DevOps
  { name: 'AWS', aliases: ['aws', 'amazon web services'] },
  { name: 'Google Cloud (GCP)', aliases: ['gcp', 'google cloud'] },
  { name: 'Azure', aliases: ['azure', 'microsoft azure'] },
  { name: 'Docker', aliases: ['docker'] },
  { name: 'Kubernetes', aliases: ['kubernetes', 'k8s'] },
  { name: 'Terraform', aliases: ['terraform'] },
  { name: 'CI/CD', aliases: ['ci/cd', 'continuous integration', 'continuous deployment'] },
  { name: 'Jenkins', aliases: ['jenkins'] },
  { name: 'GitHub Actions', aliases: ['github actions'] },
  { name: 'Ansible', aliases: ['ansible'] },
  { name: 'Nginx', aliases: ['nginx'] },
  { name: 'Linux', aliases: ['linux'] },
  { name: 'Vercel', aliases: ['vercel'] },
  { name: 'Git', aliases: ['git', 'version control'] },

  // Data / ML
  { name: 'Machine Learning', aliases: ['machine learning', 'ml'] },
  { name: 'Deep Learning', aliases: ['deep learning'] },
  { name: 'TensorFlow', aliases: ['tensorflow'] },
  { name: 'PyTorch', aliases: ['pytorch'] },
  { name: 'Pandas', aliases: ['pandas'] },
  { name: 'NumPy', aliases: ['numpy'] },
  { name: 'Data Analysis', aliases: ['data analysis', 'data analytics'] },
  { name: 'Data Engineering', aliases: ['data engineering', 'data pipeline'] },
  { name: 'ETL', aliases: ['etl'] },
  { name: 'Apache Spark', aliases: ['apache spark', 'spark'] },
  { name: 'Tableau', aliases: ['tableau'] },
  { name: 'Power BI', aliases: ['power bi', 'powerbi'] },
  { name: 'NLP', aliases: ['nlp', 'natural language processing'] },
  { name: 'Computer Vision', aliases: ['computer vision'] },

  // Testing
  { name: 'Unit Testing', aliases: ['unit testing', 'unit tests'] },
  { name: 'Jest', aliases: ['jest'] },
  { name: 'Cypress', aliases: ['cypress'] },
  { name: 'Selenium', aliases: ['selenium'] },
  { name: 'Playwright', aliases: ['playwright'] },
  { name: 'Test Automation', aliases: ['test automation', 'automated testing'] },

  // Design / product / other tools
  { name: 'Figma', aliases: ['figma'] },
  { name: 'UI/UX Design', aliases: ['ui/ux', 'ui design', 'ux design'] },
  { name: 'Agile/Scrum', aliases: ['agile', 'scrum'] },
  { name: 'Jira', aliases: ['jira'] },
  { name: 'Product Management', aliases: ['product management'] },
  { name: 'Project Management', aliases: ['project management'] },
  { name: 'Technical Writing', aliases: ['technical writing'] },
  { name: 'SEO', aliases: ['seo', 'search engine optimization'] },
  { name: 'WordPress', aliases: ['wordpress'] },
  { name: 'Salesforce', aliases: ['salesforce'] },
  { name: 'Excel', aliases: ['excel', 'ms excel'] },
  { name: 'Blockchain', aliases: ['blockchain'] },
  { name: 'Solidity', aliases: ['solidity'] },
  { name: 'Cybersecurity', aliases: ['cybersecurity', 'cyber security', 'infosec'] },
];

// Escapes regex special characters in an alias, then wraps it with
// custom boundary checks instead of `\b` — `\b` treats characters like
// `+`, `#`, and `.` as non-word, so `\bC++\b` or `\bC#\b` would never
// match at all. This checks "not preceded/followed by a letter or
// digit" instead, which correctly handles symbol-containing aliases
// (C++, C#, .NET) the same way it handles plain-word ones.
function aliasToRegex(alias) {
  const escaped = alias.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?<![a-z0-9])${escaped}(?![a-z0-9])`, 'i');
}

// Returns the deduplicated list of canonical skill names found in
// `text` (case-insensitive, word-boundary-safe). Pure string matching —
// no AI, no external calls, runs entirely in this process.
export function extractSkillsFromText(text) {
  if (!text) return [];
  const found = [];
  for (const skill of SKILLS) {
    const hit = skill.aliases.some((alias) => aliasToRegex(alias).test(text));
    if (hit) found.push(skill.name);
  }
  return found;
}
