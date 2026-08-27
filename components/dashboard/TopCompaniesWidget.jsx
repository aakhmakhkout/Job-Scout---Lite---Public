// Ranks companies by open-role count, computed from the real jobs
// cache via lib/dashboardStats.js's computeTopCompanies() — wired to
// real data as of Step 17 (was mock in Steps 15/16).
import { Building2 } from 'lucide-react';

// Deterministic monogram color per company (hashed from the name, not
// random) — same company always gets the same color across renders and
// visits. Cycles through the existing palette only, no new colors
// introduced just for this. Real company logos would be nicer but
// aren't worth the added cost/complexity/fragility of fetching them
// for a free-tier personal project.
const MONOGRAM_COLORS = [
  'bg-brand/15 text-brand',
  'bg-trusted/15 text-trusted',
  'bg-rust/15 text-rust',
  'bg-review/15 text-review',
];

function monogramColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return MONOGRAM_COLORS[hash % MONOGRAM_COLORS.length];
}

function initials(name) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export default function TopCompaniesWidget({ companies }) {
  const maxRoles = Math.max(...companies.map((c) => c.openRoles), 1);

  return (
    <div className="rounded-card border border-ink/10 bg-white p-5 shadow-card dark:border-white/10 dark:bg-slate-800">
      <div className="flex items-center gap-2.5">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
          <Building2 className="h-3.5 w-3.5" strokeWidth={2.25} />
        </span>
        <h2 className="text-sm font-semibold">Top companies hiring right now</h2>
      </div>
      <p className="mt-1 pl-9 text-xs text-ink-muted dark:text-slate-400">
        By number of open roles in the current cache.
      </p>

      {companies.length === 0 ? (
        <p className="mt-4 text-xs text-ink-muted dark:text-slate-500">
          No jobs in the cache yet — run the scraper to see this fill in.
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {companies.map((company, i) => (
            <div key={company.name} className="flex items-center gap-3">
              <span className="ledger-num w-4 shrink-0 text-xs text-ink-muted dark:text-slate-500">
                {i + 1}
              </span>
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${monogramColor(company.name)}`}
                aria-hidden="true"
              >
                {initials(company.name)}
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
      )}
    </div>
  );
}
