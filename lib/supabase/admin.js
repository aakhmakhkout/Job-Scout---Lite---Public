import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// SERVER-ONLY. This client uses the service role key, which bypasses
// every Row Level Security policy in the database — it can read or
// write any user's data. Only ever import this file from Route Handlers
// (app/api/**/route.js), never from a 'use client' component or
// anything that ships to the browser.
//
// Used for exactly two things, both of which are impossible with the
// regular (RLS-scoped) client because the user isn't authenticated yet
// or is deleting their own auth identity:
//   1. Deleting a user's own auth account (self-service account deletion)
//   2. Resetting a password via email + recovery key, with no active
//      session and without sending an email (see the recover-password
//      route for why — Supabase's free-tier mailer is capped at 2
//      emails/hour, see Step 3's notes)
export function createAdminClient() {
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
