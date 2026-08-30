import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import { getAdminSession } from '@/lib/adminAuth/serverSession';

// Step 23: admin now browses the exact same shared pages (Dashboard,
// Jobs, Internships, Applications, Interviews) as a regular user,
// instead of a separate bare /admin page — but admin auth is still the
// isolated system from Step 12 (its own admin_session cookie, its own
// admin_users table), deliberately kept separate rather than merged
// into Supabase Auth. That means every shared page now needs to know
// "who, if anyone, is looking at this" across *two* possible identity
// systems, not one — this helper is the single place that resolves
// that, so pages don't each reimplement the same two-step check.
//
// Checks for a real Supabase Auth user first, admin session second —
// if someone happens to have both cookies set in the same browser
// (e.g. logged in normally, then separately visited /admin/login),
// they're treated as the regular user, not admin. Reasonable default:
// the two are meant to be separate login flows, not simultaneous.
//
// Returns one of:
//   { kind: 'user', user, supabase, previousLastSeenAt, createdAt }
//   { kind: 'admin', admin, supabase }
//   { kind: null, supabase }
// Wrapped in React's cache() — every page that needs identity (e.g.
// Dashboard, Applications) calls this itself AND AppShell calls it
// again internally for the Sidebar/UserMenu, both within the same
// request. Without memoizing, that's two separate cookie reads and,
// worse, two separate last_seen_at UPDATE writes per single page
// load. cache() deduplicates repeated calls within one request/render
// pass, so this only actually runs once no matter how many components
// call it.
export const getViewer = cache(async function getViewer() {
  const supabase = createClient();

  let user = null;
  try {
    const {
      data: { user: fetchedUser },
    } = await supabase.auth.getUser();
    user = fetchedUser;
  } catch (err) {
    console.error('getViewer: failed to fetch Supabase session', err);
  }

  if (user) {
    // Read the profile's last_seen_at/created_at BEFORE writing the
    // fresh "now" timestamp below, and hand that pre-update value back
    // to the caller (see previousLastSeenAt/createdAt on the returned
    // object). This matters for Step 30: any page that wants to show
    // "you were inactive for N days" (the Profile inactivity notice)
    // needs the value from *before* this very page load touched it —
    // reading it after the update below would always show 0, since
    // this visit itself is what's being recorded. Costs one extra
    // indexed read per page load on top of the existing write; a
    // reasonable trade for this project's scale (~100 users) rather
    // than relying on Server Component rendering order to happen to
    // put this read ahead of every other place last_seen_at might get
    // touched.
    let previousLastSeenAt = null;
    let createdAt = null;
    try {
      const { data: profileBefore } = await supabase
        .from('profiles')
        .select('last_seen_at, created_at')
        .eq('id', user.id)
        .maybeSingle();
      previousLastSeenAt = profileBefore?.last_seen_at ?? null;
      createdAt = profileBefore?.created_at ?? null;
    } catch (err) {
      console.error('getViewer: failed to read profile before update', err);
    }

    // Fire-and-await (not fire-and-forget — Vercel's serverless
    // functions can terminate before an unawaited promise finishes
    // once the response is sent, so this has to be awaited to be
    // reliable). A single indexed-row update is fast; the tradeoff is
    // one extra write per page load per logged-in user rather than
    // throttling to "once every N minutes" — accepted for now to keep
    // this step simple, worth revisiting if it becomes a real load
    // concern at higher user counts than this project targets.
    try {
      await supabase.from('profiles').update({ last_seen_at: new Date().toISOString() }).eq('id', user.id);
    } catch (err) {
      console.error('getViewer: failed to update last_seen_at', err);
    }
    return { kind: 'user', user, supabase, previousLastSeenAt, createdAt };
  }

  const admin = await getAdminSession();
  if (admin) {
    return { kind: 'admin', admin, supabase };
  }

  return { kind: null, supabase };
});
