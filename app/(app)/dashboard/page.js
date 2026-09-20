import { Zap, ShieldCheck, Send, CalendarClock, LayoutDashboard } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import StatCard from '@/components/dashboard/StatCard';
import MarketSnapshotChart from '@/components/dashboard/MarketSnapshotChart';
import TopCompaniesWidget from '@/components/dashboard/TopCompaniesWidget';
import ResourcesGridSection from '@/components/dashboard/ResourcesGridSection';
import { getJobsCache } from '@/lib/jobsCache';
import { computeMarketSnapshot, computeTopCompanies } from '@/lib/dashboardStats';
import { getResourceCategories } from '@/lib/resourceCategories';
import { getWidgetSettings } from '@/lib/dashboardWidgets';
import { getResourceItemsByCategory } from '@/lib/resourceItems';
import { getViewer } from '@/lib/viewer';
import { getAppVersion } from '@/lib/appVersion';

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
  // Update 77 — Dashboard is now reachable without an account (see
  // middleware.js). getViewer() already had a `{ kind: null }` guest
  // state built in; it just never got exercised before, since
  // middleware always redirected anonymous visitors before this page
  // ever ran.
  const isGuest = viewer.kind === null;

  // Update 46: which resource categories even exist is admin-managed
  // now (see lib/resourceCategories.js), so this has to be fetched
  // before the items query below it can know which category keys to
  // group by. getResourceCategories() already fails open internally
  // (falls back to the original two categories on error), so awaiting
  // it up front can't itself cause the page to show less than before.
  const categories = await getResourceCategories(viewer.supabase);
  const categoryKeys = categories.map((c) => c.key);

  // Applied/Interview counts come from the `applications` table, which
  // only has rows for real Supabase Auth users — an admin session has
  // no such rows (and shouldn't; admins aren't tracked as job-seekers
  // here), and neither does a guest (no account at all yet). Skipping
  // these two queries entirely for either, rather than running them
  // with a null user id, avoids both a crash and a misleading "0"
  // that looks like a real empty state.
  const [cacheResult, appliedResult, interviewResult, widgetsResult, resourceItemsResult] =
    await Promise.allSettled([
      getJobsCache(),
      isAdmin || isGuest
        ? Promise.resolve({ count: null })
        : viewer.supabase
            .from('applications')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', viewer.user.id)
            .eq('status', 'Applied'),
      isAdmin || isGuest
        ? Promise.resolve({ count: null })
        : viewer.supabase
            .from('applications')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', viewer.user.id)
            .eq('status', 'Interview'),
      // Step 26 — admin-manageable visibility/copy per Dashboard section.
      // getWidgetSettings() already fails open to all-visible/default-copy
      // internally, so this entry can't itself cause the page to show
      // less than it would have before this feature existed.
      getWidgetSettings(viewer.supabase),
      // Step 27 — the actual links inside each resource box, now
      // admin-managed via /admin/resources instead of hardcoded.
      // Also fails open internally (all categories degrade to empty,
      // which ResourceCategoryBox already renders as Coming-soon).
      getResourceItemsByCategory(viewer.supabase, categoryKeys),
    ]);

  const cache =
    cacheResult.status === 'fulfilled' ? cacheResult.value : { generated_at: null, jobs: [] };
  const appliedCount =
    appliedResult.status === 'fulfilled' ? appliedResult.value.count ?? 0 : null;
  const interviewCount =
    interviewResult.status === 'fulfilled' ? interviewResult.value.count ?? 0 : null;
  const widgets = widgetsResult.status === 'fulfilled' ? widgetsResult.value : {};
  const isVisible = (key) => widgets[key]?.visible !== false;
  const resourceItemsByCategory =
    resourceItemsResult.status === 'fulfilled' ? resourceItemsResult.value : {};

  // Real failures (query rejected) vs. intentionally-skipped-for-
  // admin-or-guest both come out as `null` above, but only the former
  // is worth warning about — a guest or admin seeing "couldn't load
  // stats, try refreshing" for something that was never going to load
  // would be a confusing, inaccurate message.
  const statsLoadFailed = !isAdmin && !isGuest && (appliedCount === null || interviewCount === null);

  const jobs = cache.jobs || [];
  const newJobsToday = jobs.filter((j) => {
    const hoursOld = (Date.now() - new Date(j.posted_at).getTime()) / 3_600_000;
    return hoursOld <= 24;
  }).length;
  const marketSnapshot = computeMarketSnapshot(jobs);
  const topCompanies = computeTopCompanies(jobs);

  // Step 26: every section below is individually admin-toggleable, so
  // these are computed once up front rather than sprinkling `isVisible()`
  // calls through the JSX — makes it obvious at a glance which sections
  // this render pass will actually include.
  const showStatNewJobs = isVisible('stat_new_jobs');
  const showStatTrusted = isVisible('stat_trusted_jobs');
  const showStatApplied = isVisible('stat_applied');
  const showStatInterviews = isVisible('stat_upcoming_interviews');
  const anyStatVisible = showStatNewJobs || showStatTrusted || showStatApplied || showStatInterviews;

  const showMarketSnapshot = isVisible('market_snapshot');
  const showTopCompanies = isVisible('top_companies');
  const showIntelligenceSection = showMarketSnapshot || showTopCompanies;

  // Update 55 — Resume Intelligence, step 7. Interview prep (the
  // Step 26 "coming soon" placeholder) is gone entirely, replaced by
  // a Resume review section.
  //
  // Update 65 — that section now lives INSIDE the resources grid as a
  // third card (see ResourcesGridSection) instead of a separate
  // full-width row below it — the earlier full-width placement left
  // an empty-looking third grid slot once there were only 2 resource
  // categories to fill a 3-column grid. The detailed report still
  // gets real room; it just renders below the whole grid now instead
  // of inside a full-width card.
  const showResumeReview = !isAdmin && isVisible('resume_review');
  const resumeReviewCopy = widgets.resume_review || {};
  // A category with no matching row in `dashboard_widgets` (true for
  // every category by default, and always true for one just added via
  // Update 46's admin UI) correctly falls through to `visible: true`
  // here — isVisible() treats "no override on record" as visible, not
  // hidden, so a brand-new category shows up immediately without
  // needing a matching widgets-table row created for it first.
  const visibleResourceCategories = categories.filter((c) => isVisible(`resource_${c.key}`));
  const showResourcesSection = visibleResourceCategories.length > 0;

  return (
    <AppShell
      title="Dashboard"
      subtitle={`Last scraper sync: ${formatSyncTime(cache.generated_at)} · ${getAppVersion()}`}
      icon={LayoutDashboard}
    >
      {anyStatVisible && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {showStatNewJobs && (
            <StatCard label="New jobs today" value={newJobsToday} icon={Zap} accent="brand" />
          )}
          {showStatTrusted && (
            <StatCard
              label="Trusted jobs"
              value={marketSnapshot.trusted + marketSnapshot.highlyTrusted}
              hint="Score 70+"
              icon={ShieldCheck}
              accent="trusted"
            />
          )}
          {showStatApplied && (
            <StatCard
              label="Applied"
              value={isAdmin ? '—' : appliedCount ?? '—'}
              hint={isAdmin ? 'Not tracked for admin' : isGuest ? 'Log in to track' : undefined}
              icon={Send}
              accent="brand"
            />
          )}
          {showStatInterviews && (
            <StatCard
              label="Upcoming interviews"
              value={isAdmin ? '—' : interviewCount ?? '—'}
              hint={isAdmin ? 'Not tracked for admin' : isGuest ? 'Log in to track' : undefined}
              icon={CalendarClock}
              accent="rust"
            />
          )}
        </div>
      )}

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

      {showIntelligenceSection && (
        <div className="mt-8">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-muted dark:text-slate-400">
            Market intelligence
          </h2>
          <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {showMarketSnapshot && <MarketSnapshotChart data={marketSnapshot} />}
            {showTopCompanies && <TopCompaniesWidget companies={topCompanies} />}
          </div>
        </div>
      )}

      {(showResourcesSection || showResumeReview) && (
        <div className="mt-6">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-muted dark:text-slate-400">
            Resources &amp; prep
          </h2>
          {/* Update 65: the Resume review box moved INTO this grid as
              a third card (matching ResourceCategoryBox's size/shape)
              instead of living in its own full-width row below —
              filling the empty third slot Update 55 left once
              Interview prep was removed and there were only 2
              resource categories. Detailed report still opens below
              the whole grid, just now via ResourcesGridSection's own
              state instead of an inline expand within a full-width
              card. */}
          <div className="mt-3">
            <ResourcesGridSection
              isGuest={isGuest}
              categories={visibleResourceCategories.map((category) => {
                const override = widgets[`resource_${category.key}`] || {};
                return {
                  key: category.key,
                  title: override.title || category.title,
                  description: override.description || category.description,
                  items: resourceItemsByCategory[category.key] || [],
                };
              })}
              resumeBoxTitle={resumeReviewCopy.title || 'Resume review'}
              resumeBoxDescription={
                resumeReviewCopy.description ||
                'Upload your resume for an instant score, tips, and job matches.'
              }
            />
          </div>
        </div>
      )}
    </AppShell>
  );
}
