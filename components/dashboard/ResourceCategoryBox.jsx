import ComingSoonBox from './ComingSoonBox';

// Reuses ComingSoonBox for the empty-items state instead of duplicating
// that markup — a category with items=[] (e.g. "Useful websites" right
// now) should look and feel identical to "Interview prep," since both
// are the same underlying idea: structure exists, content doesn't yet.
export default function ResourceCategoryBox({ title, description, items }) {
  if (!items || items.length === 0) {
    return <ComingSoonBox title={title} description={description} />;
  }

  return (
    <div className="rounded-card border border-ink/10 bg-white p-5 shadow-card dark:border-white/10 dark:bg-slate-800">
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-1 text-xs text-ink-muted dark:text-slate-400">{description}</p>

      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <a
            key={item.name}
            href={item.url}
            target="_blank"
            rel="noreferrer"
            className="block rounded-md border border-ink/10 p-3 transition-colors hover:border-brand/40 dark:border-white/10"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium">{item.name}</span>
              <span className="shrink-0 text-xs font-medium text-brand">Visit →</span>
            </div>
            <p className="mt-0.5 text-xs text-ink-muted dark:text-slate-400">{item.description}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
