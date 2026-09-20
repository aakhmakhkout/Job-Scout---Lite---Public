'use client';

import { useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import AuthInput from './AuthInput';
import { loginWithPassword } from '@/lib/authLogin';

// Update 77 — the guest-mode login popup. Jobs/Internships and
// Dashboard are now browsable without an account (see middleware.js);
// this is what shows up the moment a guest tries an account-scoped
// action (Save, Mark applied, Block a company, upload a resume)
// instead of that action just silently 401-ing.
//
// A real embedded form, not a "go log in" link out to /login — chosen
// specifically so a guest doesn't lose their place: no navigation
// happens at all here, this is an overlay on the exact page they were
// already on. Combined with `onSuccess` (see below), that's also what
// makes "return to where I was" work — there's nowhere to "return"
// FROM, since the guest never left.
//
// `onSuccess` is called after a real, successful login — the caller
// (JobsPageClient, ResourcesGridSection) is expected to do two things
// with it: call router.refresh() so this render's stale isGuest=true
// prop gets replaced with fresh server data on the NEXT action, and
// re-run whatever the guest originally clicked (the "pending action"
// each caller already had to capture to know to open this modal in
// the first place) — that's what makes this feel like the action just
// worked, rather than "log in, then go click Save again yourself."
export default function LoginModal({ open, onClose, onSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await loginWithPassword(email, password);
    setLoading(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setEmail('');
    setPassword('');
    onSuccess?.();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop — closes the modal on outside click, same pattern
          UserMenu already uses for its own dropdown. */}
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="fixed inset-0 bg-ink/40 backdrop-blur-sm dark:bg-black/60"
      />

      <div className="relative w-full max-w-sm rounded-card border border-ink/10 bg-white p-6 shadow-card-hover dark:border-white/10 dark:bg-slate-800">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 text-ink-muted hover:text-ink-soft dark:text-slate-400 dark:hover:text-slate-200"
        >
          <X className="h-4 w-4" strokeWidth={2} />
        </button>

        <h2 className="text-base font-semibold">Log in</h2>
        <p className="mt-1 text-sm text-ink-muted dark:text-slate-400">
          You'll need an account for that — log in below and we'll pick up right where you
          were.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <AuthInput
            label="Email"
            type="email"
            autoComplete="email"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <AuthInput
            label="Password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && (
            <p className="rounded-md bg-suspicious/10 px-3 py-2 text-sm text-suspicious">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-brand px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
          >
            {loading ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <div className="mt-4 flex justify-between text-sm">
          <Link href="/reset-password" className="text-brand hover:underline dark:text-brand-light">
            Forgot password?
          </Link>
          {/* Signup is its own multi-step flow (resume upload,
              onboarding) — genuinely out of scope for a popup, so this
              is a real navigation, not embedded. Guest browsing state
              isn't lost by that in any meaningful sense (there's
              nothing account-scoped to lose yet). */}
          <Link
            href="/signup"
            className="text-brand hover:underline dark:text-brand-light"
          >
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}
