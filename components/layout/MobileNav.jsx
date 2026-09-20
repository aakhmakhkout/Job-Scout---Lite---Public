'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Briefcase, GraduationCap, ClipboardList, CalendarClock, Shield, UserCircle2 } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/jobs', label: 'Jobs', icon: Briefcase },
  { href: '/internships', label: 'Interns', icon: GraduationCap },
  { href: '/applications', label: 'Tracker', icon: ClipboardList },
  { href: '/interviews', label: 'Interviews', icon: CalendarClock },
];

// Update 76 — Profile (and, with it, the only way to log out or
// delete an account) used to live exclusively inside UserMenu, which
// only renders inside the desktop-only Sidebar — meaning none of that
// was reachable at all on mobile. Regular users get a Profile tab
// here; admins get the existing Admin tab instead (no /profile route
// applies to an admin session — same reasoning UserMenu already uses
// to hide that link for admins). Admin's own mobile logout gap is
// fixed separately, on the Admin page itself — see AdminLogoutButton.
const PROFILE_NAV_ITEM = { href: '/profile', label: 'Profile', icon: UserCircle2 };
const ADMIN_NAV_ITEM = { href: '/admin', label: 'Admin', icon: Shield };

export default function MobileNav({ isAdmin = false }) {
  const pathname = usePathname();
  const items = isAdmin ? [...NAV_ITEMS, ADMIN_NAV_ITEM] : [...NAV_ITEMS, PROFILE_NAV_ITEM];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 flex border-t border-ink/10 bg-white dark:border-white/10 dark:bg-slate-950 md:hidden">
      {items.map((item) => {
        const active = pathname?.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-center text-xs font-medium ${
              active ? 'text-brand dark:text-brand-light' : 'text-ink-muted dark:text-slate-400'
            }`}
          >
            <Icon className="h-4 w-4" strokeWidth={2} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
