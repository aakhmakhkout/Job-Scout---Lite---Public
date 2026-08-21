'use client';

import { useEffect, useState } from 'react';
import RecoveryKeyDisplay from './RecoveryKeyDisplay';
import DeleteAccountModal from './DeleteAccountModal';
import { useToast } from '@/components/ui/ToastProvider';

export default function ProfilePageClient({ userEmail }) {
  const [recoveryKey, setRecoveryKey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [revealed, setRevealed] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    let cancelled = false;
    fetch('/api/account/recovery-key')
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setRecoveryKey(data.recovery_key);
      })
      .catch(() => {
        if (!cancelled) addToast("Couldn't load your recovery key", 'warning');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleRegenerate() {
    setRegenerating(true);
    try {
      const res = await fetch('/api/account/recovery-key/regenerate', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to regenerate key');
      setRecoveryKey(data.recovery_key);
      setRevealed(true);
      addToast('New recovery key generated — your old one no longer works');
    } catch (e) {
      addToast(e.message, 'warning');
    } finally {
      setRegenerating(false);
    }
  }

  return (
    <div className="max-w-lg space-y-6">
      <div className="rounded-card border border-ink/10 bg-white p-5 dark:border-white/10 dark:bg-slate-800">
        <h2 className="text-sm font-semibold">Account</h2>
        <p className="mt-2 text-sm text-ink-soft dark:text-slate-300">{userEmail}</p>
      </div>

      <div className="rounded-card border border-ink/10 bg-white p-5 dark:border-white/10 dark:bg-slate-800">
        <h2 className="text-sm font-semibold">Recovery key</h2>
        <p className="mt-1 text-sm text-ink-muted dark:text-slate-400">
          Used together with your email to reset your password — there's no email-based
          reset in this app. Keep this somewhere safe.
        </p>

        <div className="mt-3">
          {loading ? (
            <div className="h-10 animate-pulse rounded-md bg-ink/10 dark:bg-white/10" />
          ) : revealed ? (
            <RecoveryKeyDisplay recoveryKey={recoveryKey} />
          ) : (
            <button
              type="button"
              onClick={() => setRevealed(true)}
              className="rounded-md border border-ink/15 px-3 py-2 text-sm font-medium hover:border-ink/30 dark:border-white/15"
            >
              Reveal recovery key
            </button>
          )}
        </div>

        {!loading && (
          <button
            type="button"
            onClick={handleRegenerate}
            disabled={regenerating}
            className="mt-3 text-xs font-medium text-ink-muted underline decoration-dotted hover:text-brand disabled:opacity-60 dark:text-slate-400 dark:hover:text-brand-light"
          >
            {regenerating ? 'Generating…' : 'Generate a new key (invalidates the old one)'}
          </button>
        )}
      </div>

      <div className="rounded-card border border-suspicious/30 bg-white p-5 dark:border-suspicious/40 dark:bg-slate-800">
        <h2 className="text-sm font-semibold text-suspicious">Danger zone</h2>
        <p className="mt-1 text-sm text-ink-muted dark:text-slate-400">
          Permanently delete your account and all associated data.
        </p>
        <button
          type="button"
          onClick={() => setDeleteModalOpen(true)}
          className="mt-3 rounded-md border border-suspicious px-3 py-1.5 text-sm font-medium text-suspicious hover:bg-suspicious/10"
        >
          Delete account
        </button>
      </div>

      <DeleteAccountModal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} />
    </div>
  );
}
