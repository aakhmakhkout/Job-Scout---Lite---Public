// MOCK DATA STRUCTURE ONLY — see the same note in MarketSnapshotChart.jsx.
// Real version will rank companies by open-role count computed from
// cache/jobs.json.

export default function TopCompaniesWidget({ companies }) {
  const maxRoles = Math.max(...companies.map((c) => c.openRoles), 1);

  return (
    <div className="rounded-card border border-ink/10 bg-white p-5 shadow-card dark:border-white/10 dark:bg-slate-800">
      <h2 className="text-sm font-semibold">Top companies hiring right now</h2>
      <p className="mt-1 text-xs text-ink-muted dark:text-slate-400">
        By number of open roles in the current cache.
      </p>

      <div className="mt-4 space-y-3">
        {companies.map((company, i) => (
          <div key={company.name} className="flex items-center gap-3">
            <span className="ledger-num w-4 shrink-0 text-xs text-ink-muted dark:text-slate-500">
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="truncate text-sm font-medium">{company.name}</span>
                <span className="ledger-num shrink-0 text-xs text-ink-muted dark:text-slate-400">
                  {company.openRoles}
                </span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-ink/5 dark:bg-white/5">
                <div
                  className="h-full rounded-full bg-brand"
                  style={{ width: `${(company.openRoles / maxRoles) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
