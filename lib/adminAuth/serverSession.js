import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from './session';

// Node-only entry point (uses next/headers' cookies()) — for Route
// Handlers and Server Components, not middleware (which reads the
// cookie directly off the request instead, see middleware.js).

export async function getAdminSession() {
  const token = cookies().get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyAdminSessionToken(token, process.env.ADMIN_SESSION_SECRET);
}

// Same shape as lib/apiAuth.js's requireUser(), so future Phase 2 admin
// routes (import upload, approve/reject, etc.) can follow the identical
// "const { admin, unauthorized } = await requireAdmin(); if
// (unauthorized) return unauthorized;" pattern already used everywhere
// else in the app. Middleware already blocks unauthenticated requests
// to /api/admin/* before they get here — this is defense in depth, not
// the primary guard.
export async function requireAdmin() {
  const admin = await getAdminSession();

  if (!admin) {
    return {
      admin: null,
      unauthorized: NextResponse.json({ error: 'Not authenticated as admin' }, { status: 401 }),
    };
  }

  return { admin, unauthorized: null };
}
