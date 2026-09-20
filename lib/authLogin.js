// Update 77 — extracted from app/login/page.js's handleSubmit so the
// new LoginModal (components/auth/LoginModal.jsx — the guest-mode
// "log in to do that" popup) can go through the exact same login
// path instead of a second, easily-drifting copy of this logic.
// Behavior is unchanged from what app/login/page.js always did: POST
// to /api/auth/login (not supabase.auth.signInWithPassword() directly
// from the browser — that route is what actually enforces the
// server-side rate limit, Step 13).
export async function loginWithPassword(email, password) {
  let res;
  try {
    res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
  } catch {
    return { ok: false, error: 'Could not reach the server. Try again.' };
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return { ok: false, error: data.error || 'Login failed' };
  }

  return { ok: true };
}
