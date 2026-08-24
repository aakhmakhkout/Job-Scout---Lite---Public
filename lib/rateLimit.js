import { createAdminClient } from './supabase/admin';

// Backed by the login_attempts table, not an in-memory counter — see
// the comment in schema.sql section 6 for why: on Vercel's free tier,
// serverless functions don't share memory between invocations, so a
// plain Map here would silently fail to rate-limit anything once
// deployed. Shared by both admin login (scope: 'admin') and regular
// user login (scope: 'user') — same table, different threshold per
// caller.

const LOCKOUT_MINUTES = 15;

function normalize(identifier) {
  return identifier.toLowerCase().trim();
}

async function getRow(scope, identifier) {
  const admin = createAdminClient();
  const { data } = await admin
    .from('login_attempts')
    .select('*')
    .eq('scope', scope)
    .eq('identifier', normalize(identifier))
    .maybeSingle();
  return data;
}

// Call BEFORE attempting the login itself. Returns { locked: false } if
// the caller may proceed, or { locked: true, minutesLeft } if they're
// currently locked out and shouldn't even try the password check.
export async function checkRateLimit({ scope, identifier }) {
  const row = await getRow(scope, identifier);
  if (!row?.locked_until) return { locked: false };

  const lockedUntil = new Date(row.locked_until);
  if (lockedUntil <= new Date()) return { locked: false };

  const minutesLeft = Math.max(1, Math.ceil((lockedUntil - new Date()) / 60000));
  return { locked: true, minutesLeft };
}

// Call after a failed password check. Increments the failed count and,
// once it hits maxAttempts, sets a 15-minute lock. Returns how many
// attempts are left so the caller can optionally surface that.
export async function recordFailedAttempt({ scope, identifier, maxAttempts }) {
  const admin = createAdminClient();
  const id = normalize(identifier);
  const existing = await getRow(scope, id);
  const now = new Date();

  const newCount = (existing?.failed_count || 0) + 1;
  const locked = newCount >= maxAttempts;
  const lockedUntil = locked
    ? new Date(now.getTime() + LOCKOUT_MINUTES * 60000).toISOString()
    : null;

  if (existing) {
    await admin
      .from('login_attempts')
      .update({ failed_count: newCount, locked_until: lockedUntil, updated_at: now.toISOString() })
      .eq('id', existing.id);
  } else {
    await admin
      .from('login_attempts')
      .insert({ scope, identifier: id, failed_count: newCount, locked_until: lockedUntil });
  }

  return { locked, attemptsRemaining: Math.max(maxAttempts - newCount, 0) };
}

// Call after a successful login — resets the counter so a legitimate
// user who mistyped their password a couple times isn't left sitting
// close to the threshold indefinitely.
export async function clearAttempts({ scope, identifier }) {
  const admin = createAdminClient();
  const existing = await getRow(scope, identifier);
  if (!existing) return;

  await admin
    .from('login_attempts')
    .update({ failed_count: 0, locked_until: null, updated_at: new Date().toISOString() })
    .eq('id', existing.id);
}
