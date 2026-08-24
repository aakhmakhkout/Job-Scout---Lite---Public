import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyPassword } from '@/lib/adminAuth/password';
import { createAdminSessionToken, ADMIN_SESSION_COOKIE } from '@/lib/adminAuth/session';
import { checkRateLimit, recordFailedAttempt, clearAttempts } from '@/lib/rateLimit';

const MAX_ADMIN_ATTEMPTS = 3;

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

  if (!process.env.ADMIN_SESSION_SECRET) {
    console.error('ADMIN_SESSION_SECRET is not set — admin login cannot issue sessions.');
    return NextResponse.json({ error: 'Admin login is not configured' }, { status: 500 });
  }

  // Check the lock BEFORE touching admin_users at all — a locked-out
  // caller shouldn't get a password check (and its timing) either.
  const { locked, minutesLeft } = await checkRateLimit({ scope: 'admin', identifier: email });
  if (locked) {
    return NextResponse.json(
      { error: `Too many failed attempts. Try again in ${minutesLeft} minute(s).` },
      { status: 429 }
    );
  }

  // admin_users has zero RLS policies (intentional default-deny — see
  // schema.sql), so it's only ever reachable through the service-role
  // client, never the regular anon-key client used elsewhere in the app.
  const admin = createAdminClient();
  const { data: adminUser, error } = await admin
    .from('admin_users')
    .select('id, email, password_hash')
    .eq('email', email.toLowerCase().trim())
    .maybeSingle();

  // Deliberately generic error whether the email doesn't exist or the
  // password is wrong — same reasoning as /api/auth/recover-password
  // from Step 8: a failed attempt shouldn't reveal which admin emails
  // are registered.
  if (error || !adminUser || !verifyPassword(password, adminUser.password_hash)) {
    await recordFailedAttempt({ scope: 'admin', identifier: email, maxAttempts: MAX_ADMIN_ATTEMPTS });
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  await clearAttempts({ scope: 'admin', identifier: email });

  const token = await createAdminSessionToken(
    { adminId: adminUser.id, email: adminUser.email },
    process.env.ADMIN_SESSION_SECRET
  );

  cookies().set({
    name: ADMIN_SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8, // 8 hours, matches the token's own exp
  });

  return NextResponse.json({ ok: true, email: adminUser.email });
}
