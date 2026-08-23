// Segmented bar showing how the current cache breaks down by trust
// tier, computed from real data via lib/dashboardStats.js's
// computeMarketSnapshot() — wired to real data as of Step 17 (was mock
// in Steps 15/16). Tier boundaries match lib/mockData.js's
// trustBadgeLabel/Color so this agrees with every job card's own badge.

const TIERS = [
  { key: 'trusted', label: 'Trusted', color: 'bg-trusted' },
  { key: 'good', label: 'Good', color: 'bg-good' },
  { key: 'review', label: 'Review', color: 'bg-review' },
  { key: 'suspicious', label: 'Suspicious', color: 'bg-suspicious' },
];

export default function MarketSnapshotChart({ data }) {
  const total = TIERS.reduce((sum, t) => sum + (data[t.key] || 0), 0);

  return (
    <div className="rounded-card border border-ink/10 bg-white p-5 shadow-card dark:border-white/10 dark:bg-slate-800">
      <h2 className="text-sm font-semibold">Market snapshot</h2>
      <p className="mt-1 text-xs text-ink-muted dark:text-slate-400">
        How today's {total} cached listings break down by trust tier.
      </p>

      <div className="mt-4 flex h-3 w-full overflow-hidden rounded-full bg-ink/5 dark:bg-white/5">
        {TIERS.map((tier) => {
          const count = data[tier.key] || 0;
          const pct = total > 0 ? (count / total) * 100 : 0;
          return (
            <div
              key={tier.key}
              className={tier.color}
              style={{ width: `${pct}%` }}
              title={`${tier.label}: ${count}`}
            />
          );
        })}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {TIERS.map((tier) => (
          <div key={tier.key} className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${tier.color}`} />
            <span className="text-xs text-ink-soft dark:text-slate-300">
              {tier.label} <span className="ledger-num text-ink-muted dark:text-slate-500">{data[tier.key] || 0}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
