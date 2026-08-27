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
//
// Each item's `icon` is a lucide-react icon name (see the ICONS map in
// ResourceCategoryBox.jsx) — picked to match what the tool actually
// does, not decoration.

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
        icon: 'FileEdit',
      },
      {
        name: 'Overleaf',
        description:
          'Free browser-based LaTeX editor — good for precise, consistent typesetting. Core editing and compiling is free; some collaboration features are paid.',
        url: 'https://www.overleaf.com',
        icon: 'FileText',
      },
      {
        name: 'Google Docs resume templates',
        description: "Built into Google Docs' template gallery — genuinely free, easy to share as a PDF.",
        url: 'https://docs.google.com/document/u/0/?ftv=1&tgif=d',
        icon: 'FileText',
      },
    ],
  },
  {
    // Merged from the previously-separate "Useful websites" and "Useful
    // tools" boxes (both empty placeholders since Step 18) — Step 20
    // feedback was that splitting them added structure without adding
    // value while both were empty, and content for one is content for
    // the other. One populated box beats two half-empty ones.
    key: 'free-tools',
    title: 'Free tools & sites',
    description: 'No paywall, no catch — for job hunting and for building things.',
    items: [
      {
        name: 'Stirling PDF',
        description:
          'Free, open-source PDF toolkit — merge, split, compress, convert, and e-sign PDFs, either self-hosted or via their hosted demo. Handy for trimming a resume or combining application documents.',
        url: 'https://www.stirlingpdf.com',
        icon: 'FileStack',
      },
      {
        name: 'Free for Dev',
        description:
          'A community-maintained list of 1,000+ genuinely free developer/infra tiers — hosting, databases, CI/CD, monitoring, and more, all in one searchable page.',
        url: 'https://free-for.dev',
        icon: 'Wrench',
      },
      {
        name: 'Fix My Itch (Razorpay)',
        description:
          "Razorpay's public, data-backed repository of real problems people actually have — worth a look if you're weighing what to build alongside the job hunt, not just where to apply.",
        url: 'https://razorpay.com/m/fix-my-itch/',
        icon: 'Lightbulb',
      },
      {
        name: 'Excalidraw',
        description:
          'Free, no-signup virtual whiteboard — good for sketching system designs before a technical interview or talking through an idea on a call.',
        url: 'https://excalidraw.com',
        icon: 'PenTool',
      },
      {
        name: 'Photopea',
        description:
          'Free, browser-based Photoshop-compatible editor — opens .psd files directly. Useful for tweaking a headshot or a portfolio graphic without installing anything.',
        url: 'https://www.photopea.com',
        icon: 'Image',
      },
    ],
  },
];
