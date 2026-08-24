import { createBrowserClient } from '@supabase/ssr';

// Used in client components ('use client'). Reads the two public env vars —
// safe to expose to the browser, RLS policies are what actually protect data.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
