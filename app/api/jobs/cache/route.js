import { NextResponse } from 'next/server';
import { getJobsCache } from '@/lib/jobsCache';

// This is the frontend's primary data source for jobs — a flat JSON file
// written by the Python scraper (Step 5), not a live database query.
// That's the whole trick to staying on free tiers at ~100 users: reading a
// file costs nothing, whereas 100 users polling a database directly would
// add up fast even on Supabase's free row-read allowance.

export async function GET() {
  const data = await getJobsCache();

  return NextResponse.json(data, {
    headers: {
      // 10-minute edge/browser cache, per the performance spec — this is
      // what keeps repeated page loads from re-reading the file at all.
      'Cache-Control': 'public, max-age=600, stale-while-revalidate=60',
    },
  });
}
