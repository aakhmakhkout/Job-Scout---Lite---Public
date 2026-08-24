import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit, recordFailedAttempt, clearAttempts } from '@/lib/rateLimit';

const MAX_USER_ATTEMPTS = 5;

// New in Step 13. Previously the login page called
// supabase.auth.signInWithPassword() directly from the browser — that
// worked fine for auth itself, but meant there was no server-side point
// to enforce a login attempt limit at all. This route proxies the same
// call server-side instead, using lib/supabase/server.js's cookie-aware
// client (so the session cookie still gets set correctly on success),
// with the rate-limit check wrapped around it.
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { email, password } = body || {};
  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }

  const { locked, minutesLeft } = await checkRateLimit({ scope: 'user', identifier: email });
  if (locked) {
    return NextResponse.json(
      { error: `Too many failed attempts. Try again in ${minutesLeft} minute(s).` },
      { status: 429 }
    );
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    await recordFailedAttempt({ scope: 'user', identifier: email, maxAttempts: MAX_USER_ATTEMPTS });
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  await clearAttempts({ scope: 'user', identifier: email });
  return NextResponse.json({ ok: true });
}
