import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// Deliberately unauthenticated — the whole point is recovering access
// without being logged in. Safety comes from the recovery key's entropy
// (a UUID v4, effectively unguessable) rather than rate limiting, which
// would need paid infrastructure this project doesn't use. Error
// messages are intentionally generic and don't reveal whether the email
// or the key was the wrong part, to avoid leaking which registered
// emails exist in the system.
export async function POST(request) {
  const body = await request.json().catch(() => null);
  const email = body?.email?.trim().toLowerCase();
  const recoveryKey = body?.recovery_key?.trim();
  const newPassword = body?.new_password;

  if (!email || !recoveryKey || !newPassword) {
    return NextResponse.json(
      { error: 'Email, recovery key, and new password are all required' },
      { status: 400 }
    );
  }
  if (newPassword.length < 6) {
    return NextResponse.json(
      { error: 'Password must be at least 6 characters' },
      { status: 400 }
    );
  }

  const GENERIC_ERROR = { error: 'Invalid email or recovery key' };

  try {
    const admin = createAdminClient();

    const { data: profile, error: lookupError } = await admin
      .from('profiles')
      .select('id, recovery_key')
      .eq('email', email)
      .maybeSingle();

    if (lookupError) throw lookupError;
    if (!profile || !profile.recovery_key || profile.recovery_key !== recoveryKey) {
      return NextResponse.json(GENERIC_ERROR, { status: 401 });
    }

    const { error: updateError } = await admin.auth.admin.updateUserById(profile.id, {
      password: newPassword,
    });
    if (updateError) throw updateError;

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || 'Something went wrong resetting your password' },
      { status: 500 }
    );
  }
}
