import { Zap, ShieldCheck, Send, CalendarClock } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import StatCard from '@/components/dashboard/StatCard';
import MarketSnapshotChart from '@/components/dashboard/MarketSnapshotChart';
import TopCompaniesWidget from '@/components/dashboard/TopCompaniesWidget';
import ResourceCategoryBox from '@/components/dashboard/ResourceCategoryBox';
import ComingSoonBox from '@/components/dashboard/ComingSoonBox';
import { getJobsCache } from '@/lib/jobsCache';
import { computeMarketSnapshot, computeTopCompanies } from '@/lib/dashboardStats';
import { RESOURCE_CATEGORIES } from '@/lib/resourceCategories';
import { createClient } from '@/lib/supabase/server';

function formatSyncTime(iso) {
  if (!iso) return 'never — run the scraper';
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // getJobsCache() already has its own internal fallback and never
  // rejects. The two Supabase count queries could still reject outright
  // on a genuine network failure (not just a query error, which Supabase
  // returns as data rather than throwing) — Promise.allSettled means one
  // failing doesn't take the whole Dashboard down with it.
  const [cacheResult, appliedResult, interviewResult] = await Promise.allSettled([
    getJobsCache(),
    supabase
      .from('applications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'Applied'),
    supabase
      .from('applications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'Interview'),
  ]);

  const cache =
    cacheResult.status === 'fulfilled' ? cacheResult.value : { generated_at: null, jobs: [] };
  const appliedCount =
    appliedResult.status === 'fulfilled' ? appliedResult.value.count ?? 0 : null;
  const interviewCount =
    interviewResult.status === 'fulfilled' ? interviewResult.value.count ?? 0 : null;

  const jobs = cache.jobs || [];
  const newJobsToday = jobs.filter((j) => {
    const hoursOld = (Date.now() - new Date(j.posted_at).getTime()) / 3_600_000;
    return hoursOld <= 24;
  }).length;
  const marketSnapshot = computeMarketSnapshot(jobs);
  const topCompanies = computeTopCompanies(jobs);

  return (
    <AppShell title="Dashboard" subtitle={`Last scraper sync: ${formatSyncTime(cache.generated_at)}`}>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="New jobs today" value={newJobsToday} icon={Zap} accent="brand" />
        <StatCard
          label="Trusted jobs"
          value={marketSnapshot.trusted}
          hint="Score 70+"
          icon={ShieldCheck}
          accent="trusted"
        />
        <StatCard label="Applied" value={appliedCount ?? '—'} icon={Send} accent="brand" />
        <StatCard
          label="Upcoming interviews"
          value={interviewCount ?? '—'}
          icon={CalendarClock}
          accent="rust"
        />
      </div>

      {(appliedCount === null || interviewCount === null) && (
        <p className="mt-3 text-xs text-suspicious">
          Couldn't load some stats from the database — showing what's available. Try refreshing.
        </p>
      )}

      {jobs.length === 0 && (
        <div className="mt-8 rounded-card border border-ink/10 bg-white p-5 dark:border-white/10 dark:bg-slate-800">
          <h2 className="text-sm font-semibold">No jobs in the cache yet</h2>
          <p className="mt-1 text-sm text-ink-muted dark:text-slate-400">
            Run <code className="ledger-num">scraper/main.py</code> to populate{' '}
            <code className="ledger-num">cache/jobs.json</code>, then refresh this page.
          </p>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-muted dark:text-slate-400">
          Market intelligence
        </h2>
        <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <MarketSnapshotChart data={marketSnapshot} />
          <TopCompaniesWidget companies={topCompanies} />
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-muted dark:text-slate-400">
          Resources &amp; prep
        </h2>
        {/* All three boxes share one grid on purpose — with the old
            "Useful websites"/"Useful tools" split (Step 15–18) gone
            (merged into one "Free tools & sites" box, Step 20), there
            are exactly 3 boxes here now, so a 3-column grid fills
            evenly instead of leaving a half-empty row like the old
            2-column Interview-prep-alone grid did. */}
        <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {RESOURCE_CATEGORIES.map((category) => (
            <ResourceCategoryBox key={category.key} {...category} />
          ))}
          <ComingSoonBox
            title="Interview prep"
            description="Question banks, mock-interview tips, and company-specific prep — planned, not built yet."
          />
        </div>
      </div>
    </AppShell>
  );
}
