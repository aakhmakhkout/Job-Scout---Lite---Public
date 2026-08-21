export default function StatCard({ label, value, hint }) {
  return (
    <div className="rounded-card border border-ink/10 bg-white p-4 shadow-card dark:border-white/10 dark:bg-slate-800">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-muted dark:text-slate-400">
        {label}
      </p>
      <p className="ledger-num mt-2 text-3xl font-semibold">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-muted dark:text-slate-400">{hint}</p>}
    </div>
  );
}
