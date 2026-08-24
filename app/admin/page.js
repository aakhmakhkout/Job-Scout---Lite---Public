import Link from 'next/link';
import { getAdminSession } from '@/lib/adminAuth/serverSession';
import AdminLogoutButton from '@/components/admin/AdminLogoutButton';

// This page reaching render at all already proves the auth layer works
// — middleware.js redirects to /admin/login before this ever runs if
// there's no valid session. Reading the session again here is just to
// display which admin is logged in, not a second auth check.
export default async function AdminHomePage() {
  const session = await getAdminSession();

  return (
    <div className="flex min-h-screen flex-col bg-paper px-4 py-8 dark:bg-slate-900">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-brand text-sm font-bold text-white">
              J
            </span>
            <span className="font-display text-lg font-semibold">JobScout Lite — Admin</span>
          </div>
          <AdminLogoutButton />
        </div>

        <div className="rounded-card border border-ink/10 bg-white p-6 shadow-card dark:border-white/10 dark:bg-slate-800">
          <h1 className="text-lg font-semibold">Logged in as {session?.email}</h1>
          <p className="mt-2 text-sm text-ink-muted dark:text-slate-400">
            Upload JSON exports from your WhatsApp/Telegram collectors, check
            for duplicates against existing jobs, and approve or reject each
            one before it becomes a real listing.
          </p>
          <Link
            href="/admin/imports"
            className="mt-4 inline-block rounded-md bg-brand px-3 py-2 text-sm font-medium text-white hover:bg-brand-dark"
          >
            Go to imports
          </Link>
        </div>
      </div>
    </div>
  );
}
