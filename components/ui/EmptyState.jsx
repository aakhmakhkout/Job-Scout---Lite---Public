import { Inbox } from 'lucide-react';

export default function EmptyState({ title, description, action, icon: Icon = Inbox }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-ink/15 px-6 py-14 text-center dark:border-white/15">
      <div className="grid h-11 w-11 place-items-center rounded-full bg-brand/10 text-brand dark:bg-brand/15 dark:text-brand-light">
        <Icon className="h-5 w-5" strokeWidth={1.8} />
      </div>
      <h3 className="mt-4 text-base font-semibold">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-ink-muted dark:text-slate-400">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
