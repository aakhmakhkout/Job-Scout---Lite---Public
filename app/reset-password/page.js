'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthShell from '@/components/auth/AuthShell';
import AuthInput from '@/components/auth/AuthInput';

// No email round-trip — resets the password directly using the account's
// email plus its recovery key (shown once at signup, viewable anytime on
// the Profile page while logged in). This avoids Supabase's free-tier
// cap of 2 auth emails/hour entirely, and works even if the person no
// longer has access to their email.
export default function ResetPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [recoveryKey, setRecoveryKey] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/recover-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          recovery_key: recoveryKey.trim(),
          new_password: newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset password');

      setDone(true);
      setTimeout(() => router.push('/login'), 1800);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <AuthShell title="Password updated" subtitle="Taking you to login…">
        <p className="text-sm text-good">
          Your password has been changed. You can log in with it now.
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Reset password" subtitle="Enter your email and recovery key">
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
          label="Recovery key"
          type="text"
          placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
          required
          value={recoveryKey}
          onChange={(e) => setRecoveryKey(e.target.value)}
        />
        <AuthInput
          label="New password"
          type="password"
          autoComplete="new-password"
          minLength={6}
          required
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        {error && (
          <p className="rounded-md bg-suspicious/10 px-3 py-2 text-sm text-suspicious">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-brand px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
        >
          {loading ? 'Resetting…' : 'Reset password'}
        </button>
      </form>

      <p className="mt-4 text-xs text-ink-muted dark:text-slate-400">
        Don't have your recovery key saved anywhere? Unfortunately there's no other way to
        recover the account — this is the tradeoff of not relying on email.
      </p>

      <Link
        href="/login"
        className="mt-4 inline-block text-sm text-brand hover:underline dark:text-brand-light"
      >
        Back to login
      </Link>
    </AuthShell>
  );
}
