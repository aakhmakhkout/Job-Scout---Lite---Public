'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserCircle2, LogOut, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import DeleteAccountModal from '@/components/account/DeleteAccountModal';

export default function UserMenu({ userEmail }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <div className="relative">
      {open && (
        // Full-screen transparent backdrop closes the dropdown on any
        // outside click — simpler and more robust than tracking every
        // possible "click elsewhere" target individually.
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-10 cursor-default"
        />
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-card border border-ink/10 bg-white px-3 py-2 text-left dark:border-white/10 dark:bg-slate-800"
      >
        <span className="truncate text-xs text-ink-soft dark:text-slate-300" title={userEmail}>
          {userEmail}
        </span>
        <span className="text-ink-muted dark:text-slate-400">
          {open ? <ChevronUp className="h-3.5 w-3.5" strokeWidth={2} /> : <ChevronDown className="h-3.5 w-3.5" strokeWidth={2} />}
        </span>
      </button>

      {open && (
        <div className="absolute bottom-full left-0 z-20 mb-2 w-full overflow-hidden rounded-md border border-ink/10 bg-white shadow-card-hover dark:border-white/10 dark:bg-slate-800">
          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-ink-soft hover:bg-ink/5 dark:text-slate-300 dark:hover:bg-white/5"
          >
            <UserCircle2 className="h-3.5 w-3.5" strokeWidth={2} />
            Profile
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-ink-soft hover:bg-ink/5 dark:text-slate-300 dark:hover:bg-white/5"
          >
            <LogOut className="h-3.5 w-3.5" strokeWidth={2} />
            Log out
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setDeleteModalOpen(true);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-suspicious hover:bg-suspicious/10"
          >
            <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
            Delete account
          </button>
        </div>
      )}

      <DeleteAccountModal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} />
    </div>
  );
}
