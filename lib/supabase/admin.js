import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// SERVER-ONLY. This client uses the service role key, which bypasses
// every Row Level Security policy in the database — it can read or
// write any user's data. Only ever import this file from Route Handlers
// (app/api/**/route.js), never from a 'use client' component or
// anything that ships to the browser.
//
// Used for:
//   1. Deleting a user's own auth account (self-service account deletion)
//   2. Resetting a password via email + recovery key, with no active
//      session and without sending an email (see the recover-password
//      route for why — Supabase's free-tier mailer is capped at 2
//      emails/hour, see Step 3's notes)
//   3. The Admin tab's user-count stats (Step 23) — an admin session has
//      no Supabase Auth identity of its own, so it can't read `profiles`
//      via the regular RLS-scoped client at all; every other row belongs
//      to someone else, which owner-only RLS correctly blocks.
export function createAdminClient() {
  // Safe to import from Route Handlers (app/api/**/route.js) and from
  // Server Components specifically under app/admin/** (already
  // established back in Step 14 for the import-review pages) — both run
  // exclusively server-side. Never import this from a 'use client'
  // component or anything else that ships to the browser.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not set. Add it to .env.local (Supabase Dashboard → ' +
        'Project Settings → API → service_role key) — this one should never be shared or ' +
        'committed, unlike the anon key.'
    );
  }

  return createSupabaseClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
