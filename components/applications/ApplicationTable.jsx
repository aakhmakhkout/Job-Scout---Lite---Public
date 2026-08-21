'use client';

import StatusBadge, { APPLICATION_STATUSES } from './StatusBadge';

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// datetime-local inputs need "YYYY-MM-DDTHH:mm" with no timezone suffix,
// but interview_date is stored as a full ISO timestamp — this converts
// between the two without shifting the displayed time.
function toDatetimeLocalValue(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function ApplicationTable({ applications, onStatusChange, onInterviewDateChange, onDelete }) {
  return (
    <div className="overflow-x-auto rounded-card border border-ink/10 dark:border-white/10">
      <table className="min-w-full divide-y divide-ink/10 text-sm dark:divide-white/10">
        <thead className="bg-paper-dim text-left text-xs uppercase tracking-wide text-ink-muted dark:bg-slate-900 dark:text-slate-400">
          <tr>
            <th className="px-4 py-2.5 font-medium">Job</th>
            <th className="px-4 py-2.5 font-medium">Company</th>
            <th className="px-4 py-2.5 font-medium">Status</th>
            <th className="px-4 py-2.5 font-medium">Applied</th>
            <th className="px-4 py-2.5 font-medium">Interview date</th>
            <th className="px-4 py-2.5 font-medium"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/5 bg-white dark:divide-white/5 dark:bg-slate-800">
          {applications.map((app) => (
            <tr key={app.id}>
              <td className="max-w-xs truncate px-4 py-3 font-medium">
                {app.apply_url ? (
                  <a href={app.apply_url} className="hover:underline" target="_blank" rel="noreferrer">
                    {app.job_title}
                  </a>
                ) : (
                  app.job_title
                )}
              </td>
              <td className="px-4 py-3 text-ink-soft dark:text-slate-300">{app.company}</td>
              <td className="px-4 py-3">
                <select
                  value={app.status}
                  onChange={(e) => onStatusChange(app.id, e.target.value)}
                  className="select-field rounded-md border border-ink/15 px-2 py-1 text-xs dark:border-white/15"
                >
                  {APPLICATION_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </td>
              <td className="ledger-num px-4 py-3 text-ink-muted dark:text-slate-400">
                {formatDate(app.applied_date)}
              </td>
              <td className="px-4 py-3">
                <input
                  type="datetime-local"
                  value={toDatetimeLocalValue(app.interview_date)}
                  onChange={(e) => {
                    const value = e.target.value ? new Date(e.target.value).toISOString() : null;
                    onInterviewDateChange(app.id, value);
                  }}
                  className="select-field ledger-num rounded-md border border-ink/15 px-2 py-1 text-xs dark:border-white/15"
                />
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  type="button"
                  onClick={() => onDelete(app.id)}
                  className="text-xs font-medium text-suspicious hover:underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
