import { Hourglass } from 'lucide-react';

export default function ComingSoonBox({ title, description }) {
  return (
    <div className="rounded-card border border-dashed border-ink/15 bg-paper-dim p-5 dark:border-white/15 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-review/10 text-review">
            <Hourglass className="h-3.5 w-3.5" strokeWidth={2.25} />
          </span>
          <h2 className="text-sm font-semibold">{title}</h2>
        </div>
        <span className="shrink-0 rounded-full bg-review/10 px-2 py-0.5 text-xs font-medium text-review">
          Coming soon
        </span>
      </div>
      <p className="mt-2 text-xs text-ink-muted dark:text-slate-400">{description}</p>
    </div>
  );
}
