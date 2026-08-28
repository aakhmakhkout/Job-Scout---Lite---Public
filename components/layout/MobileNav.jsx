'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Briefcase, GraduationCap, ClipboardList, CalendarClock } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/jobs', label: 'Jobs', icon: Briefcase },
  { href: '/internships', label: 'Interns', icon: GraduationCap },
  { href: '/applications', label: 'Tracker', icon: ClipboardList },
  { href: '/interviews', label: 'Interviews', icon: CalendarClock },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 flex border-t border-ink/10 bg-white dark:border-white/10 dark:bg-slate-950 md:hidden">
      {NAV_ITEMS.map((item) => {
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
