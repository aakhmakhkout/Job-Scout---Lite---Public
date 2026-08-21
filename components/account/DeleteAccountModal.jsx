'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function DeleteAccountModal({ open, onClose }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  async function handleDelete() {
    setDeleting(true);
    setError('');
    try {
      const res = await fetch('/api/account', { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to delete account');

      // The account (and its session) is gone server-side at this point —
      // sign out client-side too so no stale session lingers in the browser.
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push('/signup');
      router.refresh();
    } catch (err) {
      setError(err.message);
      setDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-card border border-ink/10 bg-white p-6 shadow-card-hover dark:border-white/10 dark:bg-slate-800">
        <h2 className="text-lg font-semibold text-suspicious">Delete your account?</h2>
        <p className="mt-2 text-sm text-ink-soft dark:text-slate-300">
          This permanently deletes your account, saved jobs, application tracker, interview
          data, and blocklist. This can't be undone.
        </p>

        {error && (
          <p className="mt-3 rounded-md bg-suspicious/10 px-3 py-2 text-sm text-suspicious">
            {error}
          </p>
        )}

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 rounded-md bg-suspicious px-3 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
          >
            {deleting ? 'Deleting…' : 'Yes, delete my account'}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="flex-1 rounded-md border border-ink/15 px-3 py-2 text-sm font-medium hover:border-ink/30 dark:border-white/15"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
