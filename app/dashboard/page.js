import { Zap, ShieldCheck, Send, CalendarClock, LayoutDashboard } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import StatCard from '@/components/dashboard/StatCard';
import MarketSnapshotChart from '@/components/dashboard/MarketSnapshotChart';
import TopCompaniesWidget from '@/components/dashboard/TopCompaniesWidget';
import ResourceCategoryBox from '@/components/dashboard/ResourceCategoryBox';
import ComingSoonBox from '@/components/dashboard/ComingSoonBox';
import { getJobsCache } from '@/lib/jobsCache';
import { computeMarketSnapshot, computeTopCompanies } from '@/lib/dashboardStats';
import { RESOURCE_CATEGORIES } from '@/lib/resourceCategories';
import { getViewer } from '@/lib/viewer';

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
  const viewer = await getViewer();
  const isAdmin = viewer.kind === 'admin';

  // Applied/Interview counts come from the `applications` table, which
  // only has rows for real Supabase Auth users — an admin session has
  // no such rows (and shouldn't; admins aren't tracked as job-seekers
  // here). Skipping these two queries entirely for admin, rather than
  // running them with a null user id, avoids both a crash and a
  // misleading "0" that looks like a real empty state.
  const [cacheResult, appliedResult, interviewResult] = await Promise.allSettled([
    getJobsCache(),
    isAdmin
      ? Promise.resolve({ count: null })
      : viewer.supabase
          .from('applications')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', viewer.user.id)
          .eq('status', 'Applied'),
    isAdmin
      ? Promise.resolve({ count: null })
      : viewer.supabase
          .from('applications')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', viewer.user.id)
          .eq('status', 'Interview'),
  ]);

  const cache =
    cacheResult.status === 'fulfilled' ? cacheResult.value : { generated_at: null, jobs: [] };
  const appliedCount =
    appliedResult.status === 'fulfilled' ? appliedResult.value.count ?? 0 : null;
  const interviewCount =
    interviewResult.status === 'fulfilled' ? interviewResult.value.count ?? 0 : null;

  // Real failures (query rejected) vs. intentionally-skipped-for-admin
  // both come out as `null` above, but only the former is worth
  // warning about — an admin seeing "couldn't load stats, try
  // refreshing" for something that was never going to load would be a
  // confusing, inaccurate message.
  const statsLoadFailed = !isAdmin && (appliedCount === null || interviewCount === null);

  const jobs = cache.jobs || [];
  const newJobsToday = jobs.filter((j) => {
    const hoursOld = (Date.now() - new Date(j.posted_at).getTime()) / 3_600_000;
    return hoursOld <= 24;
  }).length;
  const marketSnapshot = computeMarketSnapshot(jobs);
  const topCompanies = computeTopCompanies(jobs);

  return (
    <AppShell title="Dashboard" subtitle={`Last scraper sync: ${formatSyncTime(cache.generated_at)}`} icon={LayoutDashboard}>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="New jobs today" value={newJobsToday} icon={Zap} accent="brand" />
        <StatCard
          label="Trusted jobs"
          value={marketSnapshot.trusted}
          hint="Score 70+"
          icon={ShieldCheck}
          accent="trusted"
        />
        <StatCard
          label="Applied"
          value={isAdmin ? '—' : appliedCount ?? '—'}
          hint={isAdmin ? 'Not tracked for admin' : undefined}
          icon={Send}
          accent="brand"
        />
        <StatCard
          label="Upcoming interviews"
          value={isAdmin ? '—' : interviewCount ?? '—'}
          hint={isAdmin ? 'Not tracked for admin' : undefined}
          icon={CalendarClock}
          accent="rust"
        />
      </div>

      {statsLoadFailed && (
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
