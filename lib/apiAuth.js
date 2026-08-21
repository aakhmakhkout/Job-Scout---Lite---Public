import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Every user-data API route needs the same "who's calling, and are they
// logged in" check. Centralizing it keeps each route file focused on its
// actual logic. RLS is still the real security boundary — this is just
// UX (a clean 401 instead of an empty/confusing result).
export async function requireUser() {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      user: null,
      supabase,
      unauthorized: NextResponse.json({ error: 'Not authenticated' }, { status: 401 }),
    };
  }

  return { user, supabase, unauthorized: null };
}
