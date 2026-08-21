'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import UserMenu from './UserMenu';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/jobs', label: 'Jobs' },
  { href: '/internships', label: 'Internships' },
  { href: '/applications', label: 'Applications' },
  { href: '/interviews', label: 'Interviews' },
];

export default function Sidebar({ userEmail }) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col overflow-y-auto border-r border-ink/10 bg-paper-dim px-4 py-6 dark:border-white/10 dark:bg-slate-950 md:flex">
      <div className="mb-8 flex items-center gap-2 px-2">
        <span className="grid h-7 w-7 place-items-center rounded-md bg-brand text-sm font-bold text-white">
          J
        </span>
        <span className="font-display text-lg font-semibold">JobScout Lite</span>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? 'bg-brand/10 text-brand dark:bg-brand/15 dark:text-brand-light'
                  : 'text-ink-soft hover:bg-ink/5 dark:text-slate-300 dark:hover:bg-white/5'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-3">
        {userEmail && <UserMenu userEmail={userEmail} />}
        <div className="rounded-card border border-ink/10 bg-white p-3 text-xs text-ink-muted dark:border-white/10 dark:bg-slate-800 dark:text-slate-400">
          <p className="ledger-num">Free tier</p>
          <p className="mt-1">Jobs cached for 4 days. Synced every 6 hours.</p>
        </div>
      </div>
    </aside>
  );
}
