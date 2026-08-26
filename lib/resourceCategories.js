// Data for the Dashboard's "Resources" section. Shaped this way on
// purpose: RESOURCE_CATEGORIES is an array of { key, title, description,
// items } — the same shape a future admin-managed version (read from a
// new Supabase table instead of this file) would need. When that admin
// feature gets built, ResourceCategoryBox.jsx doesn't need to change at
// all, only where this array's data comes from.
//
// An empty `items` array is a valid, intentional state — it renders as
// a "Coming soon" card (see ResourceCategoryBox.jsx) rather than an
// empty box, for categories that exist structurally but have no real
// content yet.

export const RESOURCE_CATEGORIES = [
  {
    key: 'resume-builders',
    title: 'Resume builders',
    description: 'Genuinely free tools, not ads.',
    items: [
      {
        name: 'Resume Builder by Noumaan',
        description:
          'A free resume builder with high customization options and an ATS-friendly layout, built and maintained independently.',
        url: 'https://resume-builder-ten-blush.vercel.app/',
      },
      {
        name: 'Overleaf',
        description:
          'Free browser-based LaTeX editor — good for precise, consistent typesetting. Core editing and compiling is free; some collaboration features are paid.',
        url: 'https://www.overleaf.com',
      },
      {
        name: 'Google Docs resume templates',
        description: "Built into Google Docs' template gallery — genuinely free, easy to share as a PDF.",
        url: 'https://docs.google.com/document/u/0/?ftv=1&tgif=d',
      },
    ],
  },
  {
    key: 'useful-websites',
    title: 'Useful websites',
    description: 'Sites worth bookmarking for your job search.',
    items: [],
  },
  {
    key: 'useful-tools',
    title: 'Useful tools',
    description: 'Small tools that make the process easier.',
    items: [],
  },
];
