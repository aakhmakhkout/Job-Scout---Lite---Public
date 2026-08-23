export default function ComingSoonBox({ title, description }) {
  return (
    <div className="rounded-card border border-dashed border-ink/15 bg-paper-dim p-5 dark:border-white/15 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">{title}</h2>
        <span className="shrink-0 rounded-full bg-review/10 px-2 py-0.5 text-xs font-medium text-review">
          Coming soon
        </span>
      </div>
      <p className="mt-1 text-xs text-ink-muted dark:text-slate-400">{description}</p>
    </div>
  );
}
