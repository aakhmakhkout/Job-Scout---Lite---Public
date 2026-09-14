// Update 64 — Career Roadmap, sub-step 9 of its own mini-roadmap
// (tracked in updates.md) — the final role, closing out the 9-step
// plan. Same rules as the other four roles: 100% original writing,
// never copied/adapted from roadmap.sh or any other roadmap site,
// every resource link points to official documentation only.
export const MOBILE_ROADMAP = {
  role: 'Mobile',
  description:
    'From version control through the real fork every mobile developer eventually makes — native per-platform or cross-platform — to shipping a finished app. The path most Mobile postings actually ask for today.',
  stages: [
    {
      id: 'foundations',
      title: 'Foundations',
      description: 'The base every mobile role builds on, regardless of which platform path comes next.',
      topics: [
        {
          id: 'git',
          title: 'Git & version control',
          tier: 'must',
          skillMatch: ['Git'],
          blurb: 'Branching, commits, pull requests — table stakes for any dev job, mobile included.',
          resource: { label: 'Git documentation', url: 'https://git-scm.com/doc' },
        },
      ],
    },
    {
      id: 'pick-a-path',
      title: 'Pick your platform approach',
      description:
        'This is the real fork in mobile development: native (one codebase per platform, maximum control and performance) or cross-platform (one codebase, ships to both). These are genuinely different specialties — the expectation is picking one and going deep, not learning all four.',
      topics: [
        {
          id: 'ios-swift',
          title: 'iOS (Swift)',
          tier: 'important',
          skillMatch: ['Swift', 'iOS Development'],
          blurb: "Apple's own language and platform — full access to the latest iOS features, at the cost of only shipping to iOS.",
          resource: { label: 'Swift documentation', url: 'https://www.swift.org/documentation/' },
        },
        {
          id: 'android-kotlin',
          title: 'Android (Kotlin)',
          tier: 'important',
          skillMatch: ['Kotlin', 'Android Development'],
          blurb: "Google's preferred language for Android — the same native-performance, single-platform trade-off as Swift, mirrored on the other OS.",
          resource: { label: 'Kotlin documentation', url: 'https://kotlinlang.org/docs/home.html' },
        },
        {
          id: 'react-native',
          title: 'React Native',
          tier: 'important',
          skillMatch: ['React Native'],
          blurb: 'One JavaScript/React codebase shipping to both platforms — the natural next step for developers already comfortable with React.',
          resource: { label: 'React Native documentation', url: 'https://reactnative.dev/docs/getting-started' },
        },
        {
          id: 'flutter',
          title: 'Flutter (Dart)',
          tier: 'important',
          skillMatch: ['Flutter', 'Dart'],
          blurb: "Google's cross-platform toolkit — a different trade-off than React Native: its own language (Dart) and rendering engine, but consistently praised for UI polish.",
          resource: { label: 'Flutter documentation', url: 'https://docs.flutter.dev/' },
        },
      ],
    },
    {
      id: 'shipping',
      title: 'Shipping & polish',
      description: 'Getting a finished app into someone else\u2019s hands, not just running it locally.',
      topics: [
        {
          id: 'mobile-cicd',
          title: 'CI/CD for mobile',
          tier: 'optional',
          skillMatch: ['CI/CD'],
          blurb: 'Automated builds and testing before every App Store/Play Store submission — same core idea as web CI/CD, mobile-specific tooling.',
          resource: { label: 'GitHub Actions documentation', url: 'https://docs.github.com/en/actions' },
        },
      ],
    },
  ],
};
