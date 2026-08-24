'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AdminLogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="rounded-md border border-ink/15 px-3 py-1.5 text-sm text-ink-soft transition-colors hover:bg-ink/5 disabled:opacity-60 dark:border-white/15 dark:text-slate-300 dark:hover:bg-white/5"
    >
      {loading ? 'Logging out…' : 'Log out'}
    </button>
  );
}
