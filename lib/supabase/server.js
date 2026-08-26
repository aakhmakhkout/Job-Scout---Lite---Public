import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Used in Server Components, Route Handlers, and Server Actions.
// Reads/writes the auth cookie so the session survives across requests
// without ever touching localStorage (works with SSR + the free-tier
// static-generation-friendly setup).
export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (e) {
            // Called from a Server Component — safe to ignore because the
            // middleware below refreshes the session on every request.
          }
        },
        remove(name, options) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (e) {
            // Same as above.
          }
        },
      },
    }
  );
}
