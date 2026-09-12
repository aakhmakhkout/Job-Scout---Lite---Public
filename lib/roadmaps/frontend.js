// Update 57 — Career Roadmap, sub-step 2 of its own mini-roadmap
// (tracked in updates.md). Original content, written for this
// project — not copied, adapted, or scraped from roadmap.sh or any
// other roadmap site (see Update 56's investigation notes on exactly
// why that line matters here). Every resource link below points to
// official documentation only.
//
// `skillMatch` entries are canonical skill names from
// lib/skillsDictionary.js — a topic is considered "learned" if ANY of
// its skillMatch names appear in the resume's extracted skills (see
// annotateRoadmapWithProgress in lib/roadmaps/index.js). A topic with
// no skillMatch at all (a few foundational concepts like "Semantic
// HTML" or "Web accessibility" aren't in the skills dictionary as
// their own entries) simply never shows as learned via resume
// matching — its resource link is still useful, it just can't be
// detected automatically. Honest limitation, not a bug.
//
// `tier` is 'must' | 'important' | 'optional' — a rough, honest
// read of what the current job market actually asks for in Frontend
// postings, not a universal truth. Reasonable people could rank a
// couple of these differently; it's a judgment call, not a formula.
export const FRONTEND_ROADMAP = {
  role: 'Frontend',
  description:
    'From HTML/CSS fundamentals through a modern framework, styling, state, tooling, and testing — the path most Frontend job postings actually expect today.',
  stages: [
    {
      id: 'foundations',
      title: 'Foundations',
      description: 'The non-negotiable base every other stage builds on.',
      topics: [
        {
          id: 'html',
          title: 'HTML',
          tier: 'must',
          skillMatch: ['HTML/CSS'],
          blurb: 'Semantic, accessible markup — the structure everything else sits on top of.',
          resource: { label: 'MDN: HTML', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML' },
        },
        {
          id: 'css',
          title: 'CSS',
          tier: 'must',
          skillMatch: ['HTML/CSS'],
          blurb: 'Layout (Flexbox, Grid), responsive design, and the cascade.',
          resource: { label: 'MDN: CSS', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS' },
        },
        {
          id: 'js-fundamentals',
          title: 'JavaScript fundamentals',
          tier: 'must',
          skillMatch: ['JavaScript'],
          blurb: 'The DOM, async/await, closures, array methods — before any framework.',
          resource: {
            label: 'MDN: JavaScript',
            url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
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
      id: 'framework',
      title: 'Pick a core framework',
      description:
        'React is the single most-requested framework in current Frontend postings by a wide margin — the others are genuinely good, just less commonly required.',
      topics: [
        {
          id: 'react',
          title: 'React',
          tier: 'must',
          skillMatch: ['React'],
          blurb: 'Components, hooks, and the mental model most other libraries borrow from.',
          resource: { label: 'react.dev', url: 'https://react.dev/learn' },
        },
        {
          id: 'vue',
          title: 'Vue.js',
          tier: 'optional',
          skillMatch: ['Vue.js'],
          blurb: 'A gentler learning curve than React, real market share, especially outside the US.',
          resource: { label: 'Vue.js guide', url: 'https://vuejs.org/guide/introduction.html' },
        },
        {
          id: 'angular',
          title: 'Angular',
          tier: 'optional',
          skillMatch: ['Angular'],
          blurb: 'Common in larger enterprises and government contracts specifically.',
          resource: { label: 'Angular docs', url: 'https://angular.dev/overview' },
        },
        {
          id: 'svelte',
          title: 'Svelte',
          tier: 'optional',
          skillMatch: ['Svelte'],
          blurb: 'Compiles away at build time — smaller bundles, growing but still niche in job postings.',
          resource: { label: 'Svelte docs', url: 'https://svelte.dev/docs/svelte/overview' },
        },
      ],
    },
    {
      id: 'styling',
      title: 'Styling & design systems',
      description: 'How real teams actually style production UIs today.',
      topics: [
        {
          id: 'tailwind',
          title: 'Tailwind CSS',
          tier: 'important',
          skillMatch: ['Tailwind CSS'],
          blurb: 'Utility-first CSS — the most commonly requested styling approach in current postings.',
          resource: { label: 'Tailwind CSS docs', url: 'https://tailwindcss.com/docs' },
        },
        {
          id: 'sass',
          title: 'Sass/SCSS',
          tier: 'optional',
          skillMatch: ['Sass/SCSS'],
          blurb: 'Still common in older/larger codebases that predate utility-first CSS.',
          resource: { label: 'Sass documentation', url: 'https://sass-lang.com/documentation/' },
        },
        {
          id: 'design-tools',
          title: 'Reading a Figma handoff',
          tier: 'important',
          skillMatch: ['Figma', 'UI/UX Design'],
          blurb: "You don't need to design from scratch, but reading specs from Figma is expected day-to-day.",
          resource: { label: 'Figma Learn', url: 'https://help.figma.com/hc/en-us' },
        },
        {
          id: 'accessibility',
          title: 'Web accessibility (a11y)',
          tier: 'important',
          skillMatch: [],
          blurb: 'Semantic HTML, ARIA, keyboard navigation — increasingly a stated requirement, not a nice-to-have.',
          resource: {
            label: 'MDN: Accessibility',
            url: 'https://developer.mozilla.org/en-US/docs/Web/Accessibility',
          },
        },
      ],
    },
    {
      id: 'state-and-data',
      title: 'State, routing & data',
      description: 'How a real app manages more than a handful of components.',
      topics: [
        {
          id: 'redux',
          title: 'Redux / state management',
          tier: 'important',
          skillMatch: ['Redux'],
          blurb: 'Redux specifically, or the broader idea of centralized state — either way, expect it to come up.',
          resource: { label: 'Redux documentation', url: 'https://redux.js.org/introduction/getting-started' },
        },
        {
          id: 'rest-apis',
          title: 'REST APIs & fetching data',
          tier: 'must',
          skillMatch: ['REST APIs'],
          blurb: 'Every real frontend talks to a backend — fetch, error states, loading states.',
          resource: {
            label: 'MDN: Fetch API',
            url: 'https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API',
          },
        },
        {
          id: 'graphql',
          title: 'GraphQL',
          tier: 'optional',
          skillMatch: ['GraphQL'],
          blurb: 'Common at larger companies with complex data needs; far from universal.',
          resource: { label: 'GraphQL: Learn', url: 'https://graphql.org/learn/' },
        },
      ],
    },
    {
      id: 'typescript-and-tooling',
      title: 'TypeScript & build tooling',
      description: 'What separates a hobby project from a production codebase.',
      topics: [
        {
          id: 'typescript',
          title: 'TypeScript',
          tier: 'must',
          skillMatch: ['TypeScript'],
          blurb: 'Now the default expectation in most Frontend postings, not just a "nice to have."',
          resource: { label: 'TypeScript Handbook', url: 'https://www.typescriptlang.org/docs/handbook/intro.html' },
        },
        {
          id: 'vite',
          title: 'Vite',
          tier: 'important',
          skillMatch: ['Vite'],
          blurb: "Today's default build tool for new projects — fast dev server, simple config.",
          resource: { label: 'Vite guide', url: 'https://vitejs.dev/guide/' },
        },
        {
          id: 'webpack',
          title: 'Webpack',
          tier: 'optional',
          skillMatch: ['Webpack'],
          blurb: 'Still powers plenty of existing/larger codebases even where Vite is the new default.',
          resource: { label: 'Webpack concepts', url: 'https://webpack.js.org/concepts/' },
        },
      ],
    },
    {
      id: 'meta-framework',
      title: 'Meta-frameworks & deployment',
      description: 'Where a plain React app becomes a real, deployed product.',
      topics: [
        {
          id: 'nextjs',
          title: 'Next.js',
          tier: 'important',
          skillMatch: ['Next.js'],
          blurb: 'Routing, server rendering, and API routes on top of React — the most common React meta-framework in job postings today.',
          resource: { label: 'Next.js documentation', url: 'https://nextjs.org/docs' },
        },
        {
          id: 'vercel',
          title: 'Deploying (Vercel & friends)',
          tier: 'important',
          skillMatch: ['Vercel'],
          blurb: 'Knowing how to actually ship what you build, not just run it locally.',
          resource: { label: 'Vercel documentation', url: 'https://vercel.com/docs' },
        },
      ],
    },
    {
      id: 'testing',
      title: 'Testing',
      description: 'Increasingly expected, even for smaller teams.',
      topics: [
        {
          id: 'jest',
          title: 'Jest (unit testing)',
          tier: 'important',
          skillMatch: ['Jest', 'Unit Testing'],
          blurb: 'The most common unit-testing setup for JavaScript/React codebases.',
          resource: { label: 'Jest documentation', url: 'https://jestjs.io/docs/getting-started' },
        },
        {
          id: 'e2e-testing',
          title: 'End-to-end testing (Cypress/Playwright)',
          tier: 'optional',
          skillMatch: ['Cypress', 'Playwright', 'Test Automation'],
          blurb: 'Full-flow browser testing — valuable, but far from every team requires it day one.',
          resource: { label: 'Playwright documentation', url: 'https://playwright.dev/docs/intro' },
        },
      ],
    },
  ],
};
