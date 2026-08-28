import { CalendarClock } from 'lucide-react';

function formatInterviewDate(iso) {
  const date = new Date(iso);
  return date.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function daysUntil(iso) {
  const diffMs = new Date(iso).getTime() - Date.now();
  const days = Math.round(diffMs / 86_400_000);
  if (days < 0) return 'Past';
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `In ${days} days`;
}

export default function InterviewCard({ application }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-card border border-ink/10 bg-white p-4 shadow-card dark:border-white/10 dark:bg-slate-800">
      <div className="flex min-w-0 gap-3">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-review/10 text-review">
          <CalendarClock className="h-4 w-4" strokeWidth={2.25} />
        </span>
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold">{application.job_title}</h3>
          <p className="mt-0.5 text-sm text-ink-soft dark:text-slate-300">{application.company}</p>
          <p className="ledger-num mt-2 text-xs text-ink-muted dark:text-slate-400">
            {formatInterviewDate(application.interview_date)}
          </p>
        </div>
      </div>
      <span className="shrink-0 rounded-full bg-review/10 px-2.5 py-1 text-xs font-medium text-review">
        {daysUntil(application.interview_date)}
      </span>
    </div>
  );
}
