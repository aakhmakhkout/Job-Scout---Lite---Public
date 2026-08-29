'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, Briefcase, MapPin, ArrowUpDown, Clock, ChevronDown } from 'lucide-react';
import JobCard from '@/components/jobs/JobCard';
import EmptyState from '@/components/ui/EmptyState';
import { JobCardSkeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/ToastProvider';
import BlocklistManager from '@/components/jobs/BlocklistManager';

const PAGE_SIZE = 20;

export default function JobsPageClient({ jobType = 'Job', isAdmin = false }) {
  const noun = jobType === 'Internship' ? 'internship' : 'job';
  const [allJobs, setAllJobs] = useState([]);
  const [blockedCompanies, setBlockedCompanies] = useState([]);
  const [savedByUrl, setSavedByUrl] = useState({});
  const [appliedByUrl, setAppliedByUrl] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [cacheGeneratedAt, setCacheGeneratedAt] = useState(null);

  const [search, setSearch] = useState('');
  const [role, setRole] = useState('all');
  const [location, setLocation] = useState('all');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);

  const { addToast } = useToast();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      // The jobs cache is public and essential — if this fails, the page
      // can't do anything useful, so it's treated as a hard error.
      try {
        // cache: 'no-store' — the API route sets a 10-minute
        // Cache-Control header, which is valuable for reducing load at a
        // CDN/edge level in production, but it also means a browser that
        // already fetched this once will silently keep serving that
        // stale response for up to 10 minutes, even after you've re-run
        // the scraper. That's confusing during testing ("I ran the
        // scraper but nothing changed"), so the client always bypasses
        // its own local cache and asks the server directly — this page
        // only fetches once per visit anyway, so there's no real
        // performance cost to doing so.
        const jobsRes = await fetch('/api/jobs/cache', { cache: 'no-store' });
        if (!jobsRes.ok) throw new Error('Failed to load jobs');
        const jobsData = await jobsRes.json();
        if (cancelled) return;
        setAllJobs(jobsData.jobs || []);
        setCacheGeneratedAt(jobsData.generated_at);
      } catch (e) {
        if (!cancelled) setLoadError(true);
        setLoading(false);
        return;
      }

      // Blocklist, saved jobs, and applications are all owned by a real
      // Supabase Auth user — an admin session has no rows in any of
      // these tables (same reasoning as Dashboard/Applications/
      // Interviews since Step 23), so those fetches were never going
      // to succeed. Step 23 flagged this as a known rough edge
      // ("Couldn't load your applications..." is misleading when it
      // was never going to load in the first place) and deferred the
      // fix to whenever this file got touched for the remove-a-job
      // feature — that's now, so it's fixed here instead of carried
      // forward again.
      if (isAdmin) {
        setLoading(false);
        return;
      }

      const [blocklistRes, savedRes, applicationsRes] = await Promise.allSettled([
        fetch('/api/blocklist'),
        fetch('/api/saved-jobs'),
        fetch('/api/applications'),
      ]);

      if (cancelled) return;

      if (blocklistRes.status === 'fulfilled' && blocklistRes.value.ok) {
        const data = await blocklistRes.value.json();
        setBlockedCompanies(data.blocked_companies || []);
      } else {
        addToast("Couldn't load your blocklist — jobs may show that you've blocked", 'warning');
      }

      if (savedRes.status === 'fulfilled' && savedRes.value.ok) {
        const data = await savedRes.value.json();
        const map = {};
        for (const s of data.saved_jobs || []) map[s.job_apply_url] = s.id;
        setSavedByUrl(map);
      } else {
        addToast("Couldn't load your saved jobs — Save buttons may not reflect saved state", 'warning');
      }

      if (applicationsRes.status === 'fulfilled' && applicationsRes.value.ok) {
        const data = await applicationsRes.value.json();
        const map = {};
        for (const a of data.applications || []) {
          if (a.apply_url) map[a.apply_url] = a.id;
        }
        setAppliedByUrl(map);
      } else {
        addToast("Couldn't load your applications — Mark applied may not reflect tracked state", 'warning');
      }

      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const blockedNames = useMemo(
    () => new Set(blockedCompanies.map((b) => b.company_name.toLowerCase())),
    [blockedCompanies]
  );

  async function handleBlock(companyName) {
    try {
      const res = await fetch('/api/blocklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_name: companyName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to block');
      setBlockedCompanies((prev) => [...prev, data.blocked_company]);
      addToast(`Blocked ${companyName}`);
    } catch (e) {
      addToast(e.message, 'warning');
    }
  }

  async function handleUnblock(id) {
    const prev = blockedCompanies;
    setBlockedCompanies((cur) => cur.filter((b) => b.id !== id));
    try {
      const res = await fetch(`/api/blocklist/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to unblock');
      addToast('Company unblocked');
    } catch (e) {
      setBlockedCompanies(prev);
      addToast('Could not unblock company', 'warning');
    }
  }

  // Admin-only: hide a listing from Jobs/Internships until the next
  // scraper sync (or until restored from Admin → Removed listings).
  // Removed from local state immediately on success rather than
  // waiting for a refetch — the whole point is it should disappear
  // right away, not "eventually."
  async function handleAdminRemove(job) {
    try {
      const res = await fetch('/api/admin/hidden-listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apply_url: job.apply_url,
          title: job.title,
          company: job.company,
        }),
      });
      if (!res.ok) throw new Error('Failed to remove');
      setAllJobs((prev) => prev.filter((j) => j.apply_url !== job.apply_url));
      addToast('Removed — hidden until the next sync. Undo anytime from Admin → Removed listings.');
    } catch {
      addToast('Could not remove this listing', 'warning');
    }
  }

  const visibleJobs = useMemo(
    () =>
      allJobs.filter(
        (job) =>
          !blockedNames.has((job.company || '').toLowerCase()) &&
          (job.job_type || 'Job') === jobType
      ),
    [allJobs, blockedNames, jobType]
  );

  const roles = useMemo(() => ['all', ...new Set(visibleJobs.map((j) => j.title))], [visibleJobs]);
  const locations = useMemo(
    () => ['all', ...new Set(visibleJobs.map((j) => j.location))],
    [visibleJobs]
  );

  const filtered = useMemo(() => {
    let list = visibleJobs.filter((job) => {
      const matchesSearch =
        !search ||
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.company.toLowerCase().includes(search.toLowerCase());
      const matchesRole = role === 'all' || job.title === role;
      const matchesLocation = location === 'all' || job.location === location;
      const matchesRemote = !remoteOnly || (job.location || '').toLowerCase().includes('remote');
      return matchesSearch && matchesRole && matchesLocation && matchesRemote;
    });

    list = [...list].sort((a, b) => {
      if (sortBy === 'trust') return b.trust_score - a.trust_score;
      return new Date(b.posted_at) - new Date(a.posted_at);
    });

    return list;
  }, [visibleJobs, search, role, location, remoteOnly, sortBy]);

  const paged = filtered.slice(0, page * PAGE_SIZE);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <JobCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (loadError) {
    return (
      <EmptyState
        title="Couldn't load jobs"
        description="There was a problem reaching the jobs cache. Try refreshing the page."
      />
    );
  }

  if (allJobs.length === 0) {
    return (
      <EmptyState
        title="No jobs in the cache yet"
        description="Run the scraper (scraper/main.py) to populate cache/jobs.json, then refresh this page."
      />
    );
  }

  // Distinguishing "the whole cache is empty" (above) from "the cache has
  // data, just none of this specific type" (here) — otherwise an empty
  // Internships tab looks identical to a broken scraper, when it might
  // just mean none of your current sources have open internships right
  // now. Check scraper/logs/scraper.log for the "job type breakdown"
  // line to see the real counts.
  const totalOfThisType = allJobs.filter((j) => (j.job_type || 'Job') === jobType).length;
  if (totalOfThisType === 0) {
    return (
      <EmptyState
        title={`No ${noun}s in the cache`}
        description={`The cache has ${allJobs.length} job${allJobs.length === 1 ? '' : 's'} total, but none are classified as ${noun}s right now. Check scraper/logs/scraper.log for the "job type breakdown" line to confirm — this could mean your current sources just don't have open ${noun}s at the moment, not a bug.`}
      />
    );
  }

  return (
    <>
      {cacheGeneratedAt && (
        <p className="mb-3 flex items-center gap-1.5 text-xs text-ink-muted dark:text-slate-400">
          <Clock className="h-3.5 w-3.5" strokeWidth={2} />
          Cache last updated{' '}
          {new Date(cacheGeneratedAt).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          })}
        </p>
      )}

      {!isAdmin && (
        <div className="mb-4">
          <BlocklistManager
            blockedCompanies={blockedCompanies}
            onAdd={handleBlock}
            onRemove={handleUnblock}
          />
        </div>
      )}

      <div className="flex flex-wrap gap-3 rounded-card border border-ink/10 bg-white p-4 dark:border-white/10 dark:bg-slate-800 md:items-center md:gap-4">
        <div className="relative min-w-[180px] flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted dark:text-slate-500"
            strokeWidth={2}
          />
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder={`Search title or company`}
            className="w-full rounded-md border border-ink/15 bg-transparent py-2 pl-9 pr-3 text-sm placeholder:text-ink-muted focus:border-brand dark:border-white/15 dark:placeholder:text-slate-500"
          />
        </div>

        <div className="relative shrink-0">
          <Briefcase
            className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-muted dark:text-slate-500"
            strokeWidth={2}
          />
          <select
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setPage(1);
            }}
            className="select-field rounded-md border border-ink/15 py-2 pl-8 pr-3 text-sm dark:border-white/15"
          >
            {roles.map((r) => (
              <option key={r} value={r}>
                {r === 'all' ? 'All roles' : r}
              </option>
            ))}
          </select>
        </div>

        <div className="relative shrink-0">
          <MapPin
            className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-muted dark:text-slate-500"
            strokeWidth={2}
          />
          <select
            value={location}
            onChange={(e) => {
              setLocation(e.target.value);
              setPage(1);
            }}
            className="select-field rounded-md border border-ink/15 py-2 pl-8 pr-3 text-sm dark:border-white/15"
          >
            {locations.map((l) => (
              <option key={l} value={l}>
                {l === 'all' ? 'All locations' : l}
              </option>
            ))}
          </select>
        </div>

        <label className="flex shrink-0 items-center gap-2 whitespace-nowrap text-sm">
          <input
            type="checkbox"
            checked={remoteOnly}
            onChange={(e) => {
              setRemoteOnly(e.target.checked);
              setPage(1);
            }}
            className="h-4 w-4 rounded border-ink/30 text-brand focus:ring-brand"
          />
          Remote only
        </label>

        <div className="relative shrink-0">
          <ArrowUpDown
            className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-muted dark:text-slate-500"
            strokeWidth={2}
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="select-field rounded-md border border-ink/15 py-2 pl-8 pr-3 text-sm dark:border-white/15"
          >
            <option value="newest">Sort: Newest</option>
            <option value="trust">Sort: Trust score</option>
          </select>
        </div>
      </div>

      <p className="mt-4 text-xs text-ink-muted dark:text-slate-400">
        {filtered.length} {noun}
        {filtered.length === 1 ? '' : 's'} found
      </p>

      {paged.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title={`No ${noun}s match those filters`}
            description={
              visibleJobs.length === 0
                ? `No ${noun}s in the cache right now — check back after the next scraper sync.`
                : 'Try widening your search, clearing a filter, or checking back after the next sync.'
            }
          />
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {paged.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onBlock={isAdmin ? undefined : handleBlock}
              isAdmin={isAdmin}
              onAdminRemove={handleAdminRemove}
              initialSaved={Boolean(savedByUrl[job.apply_url])}
              initialSavedJobId={savedByUrl[job.apply_url] || null}
              initialApplied={Boolean(appliedByUrl[job.apply_url])}
              initialApplicationId={appliedByUrl[job.apply_url] || null}
            />
          ))}
        </div>
      )}

      {filtered.length > paged.length && (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => setPage((p) => p + 1)}
            className="flex items-center gap-1.5 rounded-md border border-ink/15 px-4 py-2 text-sm font-medium hover:border-ink/30 dark:border-white/15 dark:hover:border-white/30"
          >
            Load more
            <ChevronDown className="h-3.5 w-3.5" strokeWidth={2.25} />
          </button>
        </div>
      )}
    </>
  );
}
