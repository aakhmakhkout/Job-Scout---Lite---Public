import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Supabase sends users here after clicking a signup-confirmation email
// link, with a `code` query param to exchange for a real session cookie.
// Not used by the password reset flow anymore (that's now email +
// recovery key, no email sent) — this route is only relevant if email
// confirmation ever gets turned back on in Supabase.
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') || '/dashboard';

  if (code) {
    const supabase = createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
