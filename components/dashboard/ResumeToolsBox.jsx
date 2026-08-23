const TOOLS = [
  {
    name: 'Your resume builder',
    description: 'A free resume builder, built and maintained independently.',
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
];

export default function ResumeToolsBox() {
  return (
    <div className="rounded-card border border-ink/10 bg-white p-5 shadow-card dark:border-white/10 dark:bg-slate-800">
      <h2 className="text-sm font-semibold">Free resume building platforms</h2>
      <p className="mt-1 text-xs text-ink-muted dark:text-slate-400">
        Genuinely free tools, not ads.
      </p>

      <div className="mt-4 space-y-3">
        {TOOLS.map((tool) => (
          <a
            key={tool.name}
            href={tool.url}
            target="_blank"
            rel="noreferrer"
            className="block rounded-md border border-ink/10 p-3 transition-colors hover:border-brand/40 dark:border-white/10"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium">{tool.name}</span>
              <span className="shrink-0 text-xs font-medium text-brand">Visit →</span>
            </div>
            <p className="mt-0.5 text-xs text-ink-muted dark:text-slate-400">{tool.description}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
