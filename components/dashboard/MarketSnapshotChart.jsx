// Segmented bar showing how the current cache breaks down by trust
// tier, computed from real data via lib/dashboardStats.js's
// computeMarketSnapshot() — wired to real data as of Step 17 (was mock
// in Steps 15/16). Tier boundaries match lib/mockData.js's
// trustBadgeLabel/Color so this agrees with every job card's own badge.
//
// Step 35 — 5 tiers now (was 3), ordered strongest to weakest so both
// the bar segments and the legend below read left-to-right / top-to-
// bottom as "most to least trustworthy," same ordering convention as
// every trust-tier list elsewhere in the app.
import { ShieldCheck } from 'lucide-react';

const TIERS = [
  { key: 'highlyTrusted', label: 'Highly Trusted', color: 'bg-highly-trusted' },
  { key: 'trusted', label: 'Trusted', color: 'bg-tier-trusted' },
  { key: 'unverified', label: 'Unverified', color: 'bg-unverified' },
  { key: 'redFlag', label: 'Red Flag', color: 'bg-red-flag' },
  { key: 'suspicious', label: 'Suspicious', color: 'bg-tier-suspicious' },
];

export default function MarketSnapshotChart({ data }) {
  const total = TIERS.reduce((sum, t) => sum + (data[t.key] || 0), 0);

  return (
    <div className="rounded-card border border-ink/10 bg-white p-5 shadow-card dark:border-white/10 dark:bg-slate-800">
      <div className="flex items-center gap-2.5">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
          <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2.25} />
        </span>
        <h2 className="text-sm font-semibold">Market snapshot</h2>
      </div>
      <p className="mt-1 pl-9 text-xs text-ink-muted dark:text-slate-400">
        How today's <span className="ledger-num">{total}</span> cached listings break down by trust tier.
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

      {/* 5 tiers now, not 3 — grid-cols-3 leaves one empty cell in the
          second row (5 doesn't divide evenly into 3), same minor,
          accepted cosmetic trade-off already established elsewhere in
          this app (e.g. Step 26's widget-hiding note) rather than
          building a dynamic column-count system for a 5-item legend. */}
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
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
