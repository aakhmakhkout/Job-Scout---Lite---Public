import { Bookmark, Send, CalendarClock, Trophy, XCircle } from 'lucide-react';

const STATUS_STYLES = {
  Saved: 'bg-ink/10 text-ink-soft dark:bg-white/10 dark:text-slate-300',
  Applied: 'bg-brand/10 text-brand dark:bg-brand/15 dark:text-brand-light',
  Interview: 'bg-review/10 text-review',
  Offer: 'bg-trusted/10 text-trusted',
  Rejected: 'bg-suspicious/10 text-suspicious',
};

// Reuses the same icons already used for the matching Dashboard stats
// (Applied → Send, Upcoming interviews → CalendarClock) so the same
// concept looks the same everywhere in the app, not just coincidentally
// similar.
const STATUS_ICONS = {
  Saved: Bookmark,
  Applied: Send,
  Interview: CalendarClock,
  Offer: Trophy,
  Rejected: XCircle,
};

export const APPLICATION_STATUSES = ['Saved', 'Applied', 'Interview', 'Offer', 'Rejected'];

export default function StatusBadge({ status }) {
  const Icon = STATUS_ICONS[status] || Bookmark;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
        STATUS_STYLES[status] || STATUS_STYLES.Saved
      }`}
    >
      <Icon className="h-3 w-3" strokeWidth={2.25} />
      {status}
    </span>
  );
}
