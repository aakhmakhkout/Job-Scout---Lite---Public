import { scryptSync, randomBytes, timingSafeEqual } from 'crypto';

// Node-only (uses the 'crypto' module's synchronous scrypt) — only ever
// import this from Route Handlers, never from middleware.js. Middleware
// runs on Vercel's Edge Runtime, which doesn't have Node's 'crypto'
// module; that's exactly why session signing/verification (which DOES
// need to run in middleware, on every request to /admin/*) lives in the
// separate session.js file instead, using Web Crypto.

const KEY_LENGTH = 64;

// Stored format: "<salt-hex>:<derived-key-hex>". A random salt per
// password means two admins (or a re-hashed same password) never
// produce the same stored value, which defeats rainbow-table lookups.
export function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = scryptSync(password, salt, KEY_LENGTH);
  return `${salt}:${derivedKey.toString('hex')}`;
}

export function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.includes(':')) return false;

  const [salt, hashHex] = storedHash.split(':');
  if (!salt || !hashHex) return false;

  const expected = Buffer.from(hashHex, 'hex');
  const actual = scryptSync(password, salt, KEY_LENGTH);

  // Lengths can differ if storedHash is malformed — timingSafeEqual
  // throws on mismatched lengths, so guard that explicitly rather than
  // letting it crash the login route.
  if (expected.length !== actual.length) return false;

  return timingSafeEqual(expected, actual);
}
