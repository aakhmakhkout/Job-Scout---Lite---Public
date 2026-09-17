'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Briefcase, GraduationCap, ClipboardList, CalendarClock, Shield } from 'lucide-react';
import UserMenu from './UserMenu';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/jobs', label: 'Jobs', icon: Briefcase },
  { href: '/internships', label: 'Internships', icon: GraduationCap },
  { href: '/applications', label: 'Applications', icon: ClipboardList },
  { href: '/interviews', label: 'Interviews', icon: CalendarClock },
];

const ADMIN_NAV_ITEM = { href: '/admin', label: 'Admin', icon: Shield };

export default function Sidebar({ userEmail, isAdmin = false }) {
  const pathname = usePathname();
  const items = isAdmin ? [...NAV_ITEMS, ADMIN_NAV_ITEM] : NAV_ITEMS;

  return (
    <aside className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col overflow-y-auto border-r border-ink/10 bg-paper-dim px-4 py-6 dark:border-white/10 dark:bg-slate-950 md:flex">
      <div className="mb-8 px-2">
        {/*
          Logo lockup has a white/teal wordmark baked into the image
          (no theme-aware text), so it sits on a fixed dark chip —
          bg-slate-950 with no dark: variant — rather than the
          sidebar's own light/dark background, to stay legible in
          both themes.
        */}
        <span className="inline-flex items-center rounded-md bg-slate-950 px-2 py-1.5">
          <Image src="/logo.png" alt="JobScout Lite" width={160} height={113} className="h-7 w-auto" priority />
        </span>
      </div>

      <nav className="flex flex-col gap-1">
        {items.map((item) => {
          const active = pathname?.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? 'bg-brand/10 text-brand dark:bg-brand/15 dark:text-brand-light'
                  : 'text-ink-soft hover:bg-ink/5 dark:text-slate-300 dark:hover:bg-white/5'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-3">
        {userEmail && <UserMenu userEmail={userEmail} isAdmin={isAdmin} />}
        <div className="rounded-card border border-ink/10 bg-white p-3 text-xs text-ink-muted dark:border-white/10 dark:bg-slate-800 dark:text-slate-400">
          <p className="ledger-num">Free tier</p>
          <p className="mt-1">Jobs cached for 4 days. Synced every 6 hours.</p>
        </div>
      </div>
    </aside>
  );
}
