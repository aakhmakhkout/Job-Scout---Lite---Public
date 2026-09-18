import { createAdminClient } from '@/lib/supabase/admin';

// Update 73 — was a local-disk read (fs/promises readFile of
// cache/jobs.json). That only worked because the scraper and this app
// ran on the same machine. The scraper now runs on its own Oracle
// Cloud VPS and this app is deployed on Vercel — two different
// filesystems with no way to share a local file — so the scraper
// uploads cache/jobs.json to a public Supabase Storage bucket after
// every run (see scraper/supabase_upload.py) and this fetches it over
// HTTPS instead. `cache: 'no-store'` so Next's own fetch cache never
// serves a stale copy from inside one serverless instance's lifetime —
// freshness is already handled by two OTHER layers that stay
// deliberately in sync: the bucket upload's own 10-minute
// cache-control (scraper/config.py's SUPABASE_CACHE_CONTROL_SECONDS)
// and this data's own consumer, app/api/jobs/cache/route.js's
// Cache-Control response header.
const CACHE_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/job-cache/jobs.json`;

// Both /api/jobs/cache (for the client-side Jobs page) and the Dashboard
// Server Component need this same data. Reading it directly here —
// rather than the Dashboard fetching its own API route — avoids the
// awkwardness of a Server Component calling its own app's API over HTTP.
export async function getJobsCache() {
  let data;
  try {
    const res = await fetch(CACHE_URL, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Supabase Storage returned HTTP ${res.status}`);
    data = await res.json();
  } catch (err) {
    console.error('getJobsCache: failed to fetch cache/jobs.json from Supabase Storage', err);
    return { generated_at: null, count: 0, jobs: [] };
  }

  const hidden = await getHiddenApplyUrls();
  if (hidden.size === 0) return data;

  const jobs = (data.jobs || []).filter((job) => !hidden.has(job.apply_url));
  return { ...data, jobs, count: jobs.length };
}

// Step 25 — admin's "remove from live listings" action (see
// supabase/schema.sql section 7). Filtering happens here, at the one
// place both consumers of the cache read from, rather than in each
// consumer separately — a job hidden by admin should disappear from
// the Jobs/Internships pages *and* every Dashboard stat/widget that
// counts jobs, not just one of the two.
//
// Deliberately fails open: if this query itself fails for any reason,
// the worse outcome is a hidden job briefly showing up again, not the
// entire Jobs page or Dashboard breaking because of a table this
// feature added. That's the same "soft failure over hard crash"
// judgment call the rest of this app makes for non-essential data.
async function getHiddenApplyUrls() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('hidden_listings').select('apply_url');
    if (error) throw error;
    return new Set((data || []).map((row) => row.apply_url));
  } catch (err) {
    console.error('getHiddenApplyUrls: failed to load hidden_listings, showing all jobs', err);
    return new Set();
  }
}

