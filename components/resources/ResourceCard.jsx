export default function ResourceCard({ name, description, url, comingSoon = false }) {
  const content = (
    <div
      className={`rounded-card border p-4 transition-colors ${
        comingSoon
          ? 'border-dashed border-ink/15 bg-paper-dim dark:border-white/15 dark:bg-slate-900'
          : 'border-ink/10 bg-white shadow-card hover:border-brand/40 dark:border-white/10 dark:bg-slate-800'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold">{name}</h3>
        {comingSoon && (
          <span className="shrink-0 rounded-full bg-review/10 px-2 py-0.5 text-xs font-medium text-review">
            Coming soon
          </span>
        )}
      </div>
      <p className="mt-1 text-sm text-ink-muted dark:text-slate-400">{description}</p>
      {!comingSoon && url && (
        <span className="mt-2 inline-block text-xs font-medium text-brand">Visit →</span>
      )}
    </div>
  );

  if (comingSoon || !url) return content;

  return (
    <a href={url} target="_blank" rel="noreferrer" className="block">
      {content}
    </a>
  );
}
