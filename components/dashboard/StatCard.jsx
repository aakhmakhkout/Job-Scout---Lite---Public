// Each stat gets its own icon + accent color rather than four identical
// boxes — makes the row scannable at a glance instead of four numbers
// that all look the same until you read the label. Accent colors are
// pulled from the existing "verification desk" palette (brand/trusted/
// rust/review), never a new color introduced just for this.
const ACCENTS = {
  brand: { bar: 'bg-brand', icon: 'text-brand', badge: 'bg-brand/10' },
  trusted: { bar: 'bg-trusted', icon: 'text-trusted', badge: 'bg-trusted/10' },
  rust: { bar: 'bg-rust', icon: 'text-rust', badge: 'bg-rust/10' },
  review: { bar: 'bg-review', icon: 'text-review', badge: 'bg-review/10' },
};

export default function StatCard({ label, value, hint, icon: Icon, accent = 'brand' }) {
  const colors = ACCENTS[accent] || ACCENTS.brand;

  return (
    <div className="relative overflow-hidden rounded-card border border-ink/10 bg-white p-4 shadow-card dark:border-white/10 dark:bg-slate-800">
      <span className={`absolute inset-y-0 left-0 w-1 ${colors.bar}`} aria-hidden="true" />
      <div className="flex items-start justify-between gap-2 pl-2">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-muted dark:text-slate-400">
          {label}
        </p>
        {Icon && (
          <span className={`shrink-0 rounded-full p-1.5 ${colors.badge}`}>
            <Icon className={`h-3.5 w-3.5 ${colors.icon}`} strokeWidth={2.25} />
          </span>
        )}
      </div>
      <p className="ledger-num mt-2 pl-2 text-3xl font-semibold">{value}</p>
      {hint && <p className="mt-1 pl-2 text-xs text-ink-muted dark:text-slate-400">{hint}</p>}
    </div>
  );
}
