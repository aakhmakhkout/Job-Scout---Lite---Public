// Update 61 — Career Roadmap, sub-step 6 of its own mini-roadmap
// (tracked in updates.md). Same rules as lib/roadmaps/frontend.js:
// 100% original writing, never copied/adapted from roadmap.sh or any
// other roadmap site, every resource link points to official
// documentation only.
export const BACKEND_ROADMAP = {
  role: 'Backend',
  description:
    'From a language and framework choice through databases, APIs, and the deployment basics every backend job now expects — the path most Backend postings actually ask for today.',
  stages: [
    {
      id: 'foundations',
      title: 'Foundations',
      description: 'The base every backend role builds on, regardless of language.',
      topics: [
        {
          id: 'sql-fundamentals',
          title: 'SQL fundamentals',
          tier: 'must',
          skillMatch: ['SQL'],
          blurb: 'Joins, indexes, and writing queries by hand before ever touching an ORM.',
          resource: {
            label: 'PostgreSQL tutorial',
            url: 'https://www.postgresql.org/docs/current/tutorial.html',
          },
        },
        {
          id: 'rest-apis',
          title: 'HTTP & REST APIs',
          tier: 'must',
          skillMatch: ['REST APIs'],
          blurb: 'Status codes, verbs, request/response cycles — the shape of almost every backend job.',
          resource: {
            label: 'MDN: HTTP overview',
            url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview',
          },
        },
        {
          id: 'git',
          title: 'Git & version control',
          tier: 'must',
          skillMatch: ['Git'],
          blurb: 'Branching, commits, pull requests — table stakes for any dev job.',
          resource: { label: 'Git documentation', url: 'https://git-scm.com/doc' },
        },
      ],
    },
    {
      id: 'language-and-framework',
      title: 'Pick a language & framework',
      description:
        'Node.js and Python show up most often in current Backend postings — the others are genuinely solid, just more common in specific niches (enterprise, legacy systems, particular industries).',
      topics: [
        {
          id: 'node-express',
          title: 'Node.js + Express.js',
          tier: 'must',
          skillMatch: ['Node.js', 'Express.js'],
          blurb: 'JavaScript on the server — the most commonly requested combination in current postings, especially alongside a React/Next.js frontend.',
          resource: { label: 'Node.js documentation', url: 'https://nodejs.org/en/docs' },
        },
        {
          id: 'python-framework',
          title: 'Python (Django, Flask, or FastAPI)',
          tier: 'important',
          skillMatch: ['Django', 'Flask', 'FastAPI', 'Python'],
          blurb: 'Django for batteries-included full apps, Flask for minimal control, FastAPI for modern async APIs — pick based on the job, not a universal ranking.',
          resource: { label: 'FastAPI documentation', url: 'https://fastapi.tiangolo.com/' },
        },
        {
          id: 'java-spring',
          title: 'Java + Spring Boot',
          tier: 'important',
          skillMatch: ['Java', 'Spring Boot'],
          blurb: 'Dominant in larger enterprises, banking, and government contracts specifically.',
          resource: { label: 'Spring Boot documentation', url: 'https://spring.io/projects/spring-boot' },
        },
        {
          id: 'dotnet',
          title: '.NET (C#)',
          tier: 'optional',
          skillMatch: ['.NET', 'C#'],
          blurb: 'Common wherever a company is already invested in the Microsoft ecosystem.',
          resource: { label: '.NET documentation', url: 'https://learn.microsoft.com/en-us/dotnet/' },
        },
        {
          id: 'rails',
          title: 'Ruby on Rails',
          tier: 'optional',
          skillMatch: ['Ruby on Rails', 'Ruby'],
          blurb: 'Less common in new postings than a decade ago, but still powers plenty of real production systems.',
          resource: { label: 'Ruby on Rails guides', url: 'https://guides.rubyonrails.org/' },
        },
        {
          id: 'laravel',
          title: 'PHP + Laravel',
          tier: 'optional',
          skillMatch: ['Laravel', 'PHP'],
          blurb: 'Still a large share of the web runs on PHP — Laravel is the modern, well-documented way to write it.',
          resource: { label: 'Laravel documentation', url: 'https://laravel.com/docs' },
        },
        {
          id: 'go',
          title: 'Go',
          tier: 'optional',
          skillMatch: ['Go'],
          blurb: 'Increasingly common for performance-sensitive services and infrastructure tooling specifically.',
          resource: { label: 'Go documentation', url: 'https://go.dev/doc/' },
        },
      ],
    },
    {
      id: 'databases',
      title: 'Databases',
      description: 'Every real backend needs to store and retrieve data reliably.',
      topics: [
        {
          id: 'postgresql',
          title: 'PostgreSQL',
          tier: 'must',
          skillMatch: ['PostgreSQL'],
          blurb: 'The most commonly requested relational database in current Backend postings.',
          resource: { label: 'PostgreSQL documentation', url: 'https://www.postgresql.org/docs/' },
        },
        {
          id: 'mysql',
          title: 'MySQL',
          tier: 'optional',
          skillMatch: ['MySQL'],
          blurb: 'Still extremely common, especially in older or WordPress-adjacent stacks.',
          resource: { label: 'MySQL documentation', url: 'https://dev.mysql.com/doc/' },
        },
        {
          id: 'mongodb',
          title: 'MongoDB',
          tier: 'important',
          skillMatch: ['MongoDB'],
          blurb: 'The most common NoSQL choice — useful when your data genuinely doesn\u2019t fit clean relational tables.',
          resource: { label: 'MongoDB documentation', url: 'https://www.mongodb.com/docs/' },
        },
        {
          id: 'redis',
          title: 'Redis',
          tier: 'important',
          skillMatch: ['Redis'],
          blurb: 'Caching, rate limiting, session storage — the default answer to "this is too slow to hit the database every time."',
          resource: { label: 'Redis documentation', url: 'https://redis.io/docs/latest/' },
        },
      ],
    },
    {
      id: 'apis-and-architecture',
      title: 'APIs & architecture',
      description: 'How real services actually talk to each other and to clients.',
      topics: [
        {
          id: 'graphql',
          title: 'GraphQL',
          tier: 'optional',
          skillMatch: ['GraphQL'],
          blurb: 'Common at larger companies with complex, deeply-nested data needs; far from universal.',
          resource: { label: 'GraphQL: Learn', url: 'https://graphql.org/learn/' },
        },
        {
          id: 'grpc',
          title: 'gRPC',
          tier: 'optional',
          skillMatch: ['gRPC'],
          blurb: 'Fast, typed service-to-service communication — mostly seen in microservice-heavy architectures.',
          resource: { label: 'gRPC documentation', url: 'https://grpc.io/docs/' },
        },
        {
          id: 'microservices',
          title: 'Microservices vs. monoliths',
          tier: 'important',
          skillMatch: ['Microservices'],
          blurb: 'Knowing when to split a system apart (and when NOT to) matters more than being able to name the pattern.',
          resource: {
            label: 'AWS: Microservices overview',
            url: 'https://aws.amazon.com/microservices/',
          },
        },
      ],
    },
    {
      id: 'deployment',
      title: 'Deployment & the cloud',
      description: 'Where a working service becomes a real, running product.',
      topics: [
        {
          id: 'docker',
          title: 'Docker',
          tier: 'must',
          skillMatch: ['Docker'],
          blurb: 'Packaging an app so it runs the same way everywhere — expected knowledge for almost any backend role now.',
          resource: { label: 'Docker documentation', url: 'https://docs.docker.com/' },
        },
        {
          id: 'kubernetes',
          title: 'Kubernetes',
          tier: 'optional',
          skillMatch: ['Kubernetes'],
          blurb: 'Container orchestration at scale — genuinely important at larger companies, overkill for most smaller ones.',
          resource: { label: 'Kubernetes documentation', url: 'https://kubernetes.io/docs/home/' },
        },
        {
          id: 'aws',
          title: 'AWS (or another cloud provider)',
          tier: 'important',
          skillMatch: ['AWS'],
          blurb: 'The specific provider matters less than understanding the core ideas — compute, storage, managed databases.',
          resource: { label: 'AWS documentation', url: 'https://docs.aws.amazon.com/' },
        },
        {
          id: 'cicd',
          title: 'CI/CD',
          tier: 'important',
          skillMatch: ['CI/CD'],
          blurb: 'Automated testing and deployment on every push — increasingly assumed, not requested.',
          resource: {
            label: 'GitHub Actions documentation',
            url: 'https://docs.github.com/en/actions',
          },
        },
      ],
    },
  ],
};
