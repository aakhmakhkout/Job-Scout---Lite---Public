import AppShell from '@/components/layout/AppShell';
import StatCard from '@/components/dashboard/StatCard';
import MarketSnapshotChart from '@/components/dashboard/MarketSnapshotChart';
import TopCompaniesWidget from '@/components/dashboard/TopCompaniesWidget';
import { getJobsCache } from '@/lib/jobsCache';
import { createClient } from '@/lib/supabase/server';

// STEP 15 — mock data for the two new widgets below. Deliberately not
// computed from the real cache yet (see PROGRESS.md / updates.md for
// why) — this step is about layout/structure, wiring real numbers in
// is a small, separate follow-up.
const MOCK_MARKET_SNAPSHOT = { trusted: 38, good: 96, review: 124, suspicious: 46 };
const MOCK_TOP_COMPANIES = [
  { name: 'Stripe', openRoles: 14 },
  { name: 'Coinbase', openRoles: 11 },
  { name: 'Airbnb', openRoles: 9 },
  { name: 'Razorpay', openRoles: 7 },
  { name: 'Postman', openRoles: 5 },
];

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
  const trustedJobsCount = jobs.filter((j) => j.trust_score >= 80).length;

  return (
    <AppShell title="Dashboard" subtitle={`Last scraper sync: ${formatSyncTime(cache.generated_at)}`}>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="New jobs today" value={newJobsToday} />
        <StatCard label="Trusted jobs" value={trustedJobsCount} hint="Score 80+" />
        <StatCard label="Applied" value={appliedCount ?? '—'} />
        <StatCard label="Upcoming interviews" value={interviewCount ?? '—'} />
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

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <MarketSnapshotChart data={MOCK_MARKET_SNAPSHOT} />
        <TopCompaniesWidget companies={MOCK_TOP_COMPANIES} />
      </div>
    </AppShell>
  );
}
