'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthShell from '@/components/auth/AuthShell';
import AuthInput from '@/components/auth/AuthInput';

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Step 13: goes through /api/auth/login now instead of calling
    // supabase.auth.signInWithPassword() directly from the browser —
    // needed so failed attempts can actually be rate-limited server-side
    // (max 5 tries before a 15-minute lock). See lib/rateLimit.js.
    let res;
    try {
      res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
    } catch {
      setLoading(false);
      setError('Could not reach the server. Try again.');
      return;
    }

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'Login failed');
      return;
    }

    const next = searchParams.get('next') || '/dashboard';
    router.push(next);
    router.refresh();
  }

  return (
    <AuthShell title="Log in" subtitle="Welcome back — check today's jobs.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInput
          label="Email"
          type="email"
          autoComplete="email"
          required
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
        <Link href="/signup" className="text-brand hover:underline dark:text-brand-light">
          Create account
        </Link>
      </div>
    </AuthShell>
  );
}
