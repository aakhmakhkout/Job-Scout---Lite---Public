'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Home' },
  { href: '/jobs', label: 'Jobs' },
  { href: '/internships', label: 'Interns' },
  { href: '/applications', label: 'Tracker' },
  { href: '/interviews', label: 'Interviews' },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 flex border-t border-ink/10 bg-white dark:border-white/10 dark:bg-slate-950 md:hidden">
      {NAV_ITEMS.map((item) => {
        const active = pathname?.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 py-2.5 text-center text-xs font-medium ${
              active ? 'text-brand dark:text-brand-light' : 'text-ink-muted dark:text-slate-400'
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
