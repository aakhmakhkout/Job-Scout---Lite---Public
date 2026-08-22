import AppShell from '@/components/layout/AppShell';
import ResourceCard from '@/components/resources/ResourceCard';

// STEP 15 — structure + real, useful free tools where they already
// exist (Overleaf, Google Docs templates). Your own resume builder is
// a placeholder card until you give me the link, at which point it
// swaps from "coming soon" to a real card — no structural change
// needed. Other categories are stubbed intentionally: real content
// for those is a future step, not invented here just to fill space.

const RESUME_TOOLS = [
  {
    name: 'Overleaf',
    description:
      'Free, browser-based LaTeX editor — good if you want a resume with precise, consistent typesetting. Core editing and compiling is free; some collaboration features are paid.',
    url: 'https://www.overleaf.com',
  },
  {
    name: 'Google Docs resume templates',
    description:
      'Built into Google Docs\' template gallery — genuinely free, no account tier restrictions, easy to share as a PDF.',
    url: 'https://docs.google.com/document/u/0/?ftv=1&tgif=d',
  },
  {
    name: 'Your resume builder',
    description: 'Link to be added here once you share it.',
    comingSoon: true,
  },
];

const UPCOMING_CATEGORIES = [
  'Interview prep',
  'Salary research',
  'Cover letter guidance',
];

export default function ResourcesPage() {
  return (
    <AppShell title="Resources" subtitle="Free tools worth knowing about, not ads.">
      <section>
        <h2 className="text-sm font-semibold text-ink-soft dark:text-slate-300">Resume building</h2>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {RESUME_TOOLS.map((tool) => (
            <ResourceCard key={tool.name} {...tool} />
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-ink-soft dark:text-slate-300">More on the way</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {UPCOMING_CATEGORIES.map((category) => (
            <span
              key={category}
              className="rounded-full border border-dashed border-ink/15 px-3 py-1 text-xs text-ink-muted dark:border-white/15 dark:text-slate-500"
            >
              {category}
            </span>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
