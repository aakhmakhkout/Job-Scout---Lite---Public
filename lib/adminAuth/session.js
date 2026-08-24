// Edge-safe by design: uses only Web Crypto (crypto.subtle) and
// btoa/atob, both available in Vercel's Edge Runtime as well as Node —
// unlike lib/adminAuth/password.js (Node-only scrypt), this file is
// imported directly by middleware.js, which runs on every request to
// /admin/* and /api/admin/*.
//
// Token shape: "<base64url(JSON payload + exp)>.<base64url(HMAC-SHA256
// signature)>" — deliberately NOT a full JWT library (no unnecessary
// dependency, no header/alg-confusion surface), just the minimum signed
// envelope this app actually needs: who's logged in, and when it
// expires. Completely separate mechanism from Supabase's own session
// cookies used for regular users.

export const ADMIN_SESSION_COOKIE = 'admin_session';
const DEFAULT_MAX_AGE_SECONDS = 60 * 60 * 8; // 8 hours

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function bytesToBase64url(bytes) {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64urlToBytes(str) {
  const padded = str + '='.repeat((4 - (str.length % 4)) % 4);
  const base64 = padded.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function getHmacKey(secret) {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

export async function createAdminSessionToken(payload, secret, maxAgeSeconds = DEFAULT_MAX_AGE_SECONDS) {
  if (!secret) throw new Error('ADMIN_SESSION_SECRET is not set — cannot sign admin sessions.');

  const exp = Math.floor(Date.now() / 1000) + maxAgeSeconds;
  const bodyB64 = bytesToBase64url(encoder.encode(JSON.stringify({ ...payload, exp })));

  const key = await getHmacKey(secret);
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(bodyB64));
  const sigB64 = bytesToBase64url(new Uint8Array(signature));

  return `${bodyB64}.${sigB64}`;
}

// Returns the decoded payload if the token is validly signed and not
// expired, or null for absolutely any failure case (missing secret,
// malformed token, bad signature, expired) — callers only ever need to
// know "authenticated or not," never *why* verification failed, so this
// deliberately doesn't throw or distinguish error types.
export async function verifyAdminSessionToken(token, secret) {
  if (!token || !secret) return null;

  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [bodyB64, sigB64] = parts;

  try {
    const key = await getHmacKey(secret);
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      base64urlToBytes(sigB64),
      encoder.encode(bodyB64)
    );
    if (!valid) return null;

    const payload = JSON.parse(decoder.decode(base64urlToBytes(bodyB64)));
    if (typeof payload.exp !== 'number' || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch (err) {
    return null;
  }
}
