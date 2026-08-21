'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthShell from '@/components/auth/AuthShell';
import AuthInput from '@/components/auth/AuthInput';
import RecoveryKeyDisplay from '@/components/account/RecoveryKeyDisplay';
import { createClient } from '@/lib/supabase/client';

// No email confirmation step — this project turns "Confirm email" off in
// Supabase (Authentication -> Providers -> Email) so signUp() returns an
// active session immediately. That sidesteps Supabase's free-tier 2
// emails/hour cap on the built-in mailer.
//
// Password reset also doesn't use email at all (see /reset-password) —
// instead every account gets a recovery key, shown once right here at
// signup, that works together with the account's email to reset the
// password later with zero emails sent.
export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [recoveryKey, setRecoveryKey] = useState(null);
  const [acknowledged, setAcknowledged] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const supabase = createClient();
    const { error: signUpError } = await supabase.auth.signUp({ email, password });

    if (signUpError) {
      setLoading(false);
      setError(signUpError.message);
      return;
    }

    try {
      const res = await fetch('/api/account/recovery-key');
      const data = await res.json();
      if (res.ok) {
        setRecoveryKey(data.recovery_key);
      } else {
        // Account was created successfully either way — a failure here
        // just means they'll get the key the first time they visit
        // /profile instead of right now. Don't block them from the app
        // over this.
        router.push('/dashboard');
        return;
      }
    } finally {
      setLoading(false);
    }
  }

  if (recoveryKey) {
    return (
      <AuthShell title="Save your recovery key" subtitle="You'll need this to reset your password">
        <p className="text-sm text-ink-soft dark:text-slate-300">
          Since account creation doesn't rely on email, password resets work differently
          here too: if you forget your password, you'll need <strong>both your email and
          this key</strong> to get back in — there's no "reset link" sent anywhere.
        </p>

        <div className="mt-4">
          <RecoveryKeyDisplay recoveryKey={recoveryKey} />
        </div>

        <p className="mt-3 text-xs text-ink-muted dark:text-slate-400">
          Save it somewhere safe now — a password manager, a note, anywhere you won't lose
          it. You can view it again anytime from your Profile page while logged in, but if
          you lose access to your account entirely, this is the only way back in.
        </p>

        <label className="mt-4 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={acknowledged}
            onChange={(e) => setAcknowledged(e.target.checked)}
            className="h-4 w-4 rounded border-ink/30 text-brand focus:ring-brand"
          />
          I've saved my recovery key
        </label>

        <button
          type="button"
          disabled={!acknowledged}
          onClick={() => router.push('/dashboard')}
          className="mt-4 w-full rounded-md bg-brand px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          Continue to dashboard
        </button>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Create account" subtitle="Free — no credit card, ever.">
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
          autoComplete="new-password"
          minLength={6}
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
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="mt-4 text-sm">
        Already have an account?{' '}
        <Link href="/login" className="text-brand hover:underline dark:text-brand-light">
          Log in
        </Link>
      </p>
    </AuthShell>
  );
}
