'use client';

import { useEffect, useRef, useState } from 'react';
import {
  FileEdit,
  FileText,
  FileStack,
  Wrench,
  Lightbulb,
  PenTool,
  Image,
  Link2,
  ChevronDown,
} from 'lucide-react';
import ComingSoonBox from './ComingSoonBox';

// Maps the `icon` string stored in lib/resourceCategories.js to an
// actual component — kept as a lookup (not a dynamic import) so the
// data file stays plain, serializable JSON-shaped data, ready for the
// future admin-managed version (Supabase table) without any component
// changes. Link2 is the fallback for any future item that doesn't
// specify one, rather than rendering nothing.
const ICONS = {
  FileEdit,
  FileText,
  FileStack,
  Wrench,
  Lightbulb,
  PenTool,
  Image,
};

// Caps the item list to roughly 4 rows before it scrolls internally —
// added because a category with more items than the others (e.g. "Free
// tools & sites" with 5, next to "Resume builders" with 3) was
// stretching its whole card taller than its siblings, throwing off the
// grid. This is an approximate pixel budget, not an exact "always
// exactly 4" — item rows vary in height with description length — but
// it keeps every Resources card visually comparable regardless of how
// many items it holds.
const VISIBLE_HEIGHT_PX = 400;

export default function ResourceCategoryBox({ title, description, items }) {
  const scrollRef = useRef(null);
  const [canScrollMore, setCanScrollMore] = useState(false);

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    const hasOverflow = el.scrollHeight > el.clientHeight + 2;
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 2;
    setCanScrollMore(hasOverflow && !atBottom);
  };

  useEffect(() => {
    updateScrollState();
    window.addEventListener('resize', updateScrollState);
    return () => window.removeEventListener('resize', updateScrollState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  if (!items || items.length === 0) {
    return <ComingSoonBox title={title} description={description} />;
  }

  const handleArrowClick = () => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ top: el.clientHeight * 0.85, behavior: 'smooth' });
  };

  return (
    <div className="rounded-card border border-ink/10 bg-white p-5 shadow-card dark:border-white/10 dark:bg-slate-800">
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-1 text-xs text-ink-muted dark:text-slate-400">{description}</p>

      <div className="relative mt-4">
        <div
          ref={scrollRef}
          onScroll={updateScrollState}
          className="scrollbar-hide space-y-3 overflow-y-auto"
          style={{ maxHeight: VISIBLE_HEIGHT_PX }}
        >
          {items.map((item) => {
            const Icon = ICONS[item.icon] || Link2;
            return (
              <a
                key={item.name}
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="group flex gap-3 rounded-md border border-ink/10 p-3 transition-colors hover:border-brand/40 hover:bg-brand/[0.03] dark:border-white/10 dark:hover:bg-brand/[0.06]"
              >
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
                  <Icon className="h-3.5 w-3.5" strokeWidth={2.25} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-sm font-medium">{item.name}</span>
                    <span className="shrink-0 text-xs font-medium text-brand opacity-0 transition-opacity group-hover:opacity-100">
                      Visit →
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-ink-muted dark:text-slate-400">{item.description}</p>
                </div>
              </a>
            );
          })}
        </div>

        {canScrollMore && (
          <>
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white to-transparent dark:from-slate-800"
              aria-hidden="true"
            />
            <button
              type="button"
              onClick={handleArrowClick}
              aria-label={`Show more in ${title}`}
              className="absolute bottom-1 left-1/2 flex h-6 w-6 -translate-x-1/2 animate-bounce items-center justify-center rounded-full border border-ink/10 bg-white text-ink-muted shadow-card transition-colors hover:border-brand/40 hover:text-brand dark:border-white/10 dark:bg-slate-800 dark:text-slate-400"
            >
              <ChevronDown className="h-3.5 w-3.5" strokeWidth={2.5} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
