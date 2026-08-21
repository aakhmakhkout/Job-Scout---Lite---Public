const STATUS_STYLES = {
  Saved: 'bg-ink/10 text-ink-soft dark:bg-white/10 dark:text-slate-300',
  Applied: 'bg-brand/10 text-brand dark:bg-brand/15 dark:text-brand-light',
  Interview: 'bg-review/10 text-review',
  Offer: 'bg-trusted/10 text-trusted',
  Rejected: 'bg-suspicious/10 text-suspicious',
};

export const APPLICATION_STATUSES = ['Saved', 'Applied', 'Interview', 'Offer', 'Rejected'];

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${
        STATUS_STYLES[status] || STATUS_STYLES.Saved
      }`}
    >
      {status}
    </span>
  );
}
