import { readFile } from 'fs/promises';
import path from 'path';
import { createAdminClient } from '@/lib/supabase/admin';

const CACHE_PATH = path.join(process.cwd(), 'cache', 'jobs.json');

// Both /api/jobs/cache (for the client-side Jobs page) and the Dashboard
// Server Component need this same data. Reading the file directly here —
// rather than the Dashboard fetching its own API route — avoids the
// awkwardness of a Server Component calling its own app's API over HTTP.
export async function getJobsCache() {
  let data;
  try {
    const raw = await readFile(CACHE_PATH, 'utf-8');
    data = JSON.parse(raw);
  } catch (err) {
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

