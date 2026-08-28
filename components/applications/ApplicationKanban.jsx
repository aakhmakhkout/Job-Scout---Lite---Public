'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import StatusBadge, { APPLICATION_STATUSES } from './StatusBadge';

function toDatetimeLocalValue(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function ApplicationKanbanCard({ app, onDragStart, onDelete, onInterviewDateChange }) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, app.id)}
      className="cursor-grab rounded-md border border-ink/10 bg-white p-3 text-sm shadow-card active:cursor-grabbing dark:border-white/10 dark:bg-slate-800"
    >
      <p className="font-medium leading-tight">{app.job_title}</p>
      <p className="mt-0.5 text-xs text-ink-muted dark:text-slate-400">{app.company}</p>

      {/* Only shown for cards actually in the Interview column — this is
          what fixes interviews not appearing on /interviews: a status of
          "Interview" alone was never enough, a date has to be set too,
          and there was previously no way to set one after creation. */}
      {app.status === 'Interview' && (
        <label className="mt-2 block">
          <span className="mb-0.5 block text-[11px] font-medium text-ink-muted dark:text-slate-400">
            Interview date
          </span>
          <input
            type="datetime-local"
            value={toDatetimeLocalValue(app.interview_date)}
            onChange={(e) => {
              const value = e.target.value ? new Date(e.target.value).toISOString() : null;
              onInterviewDateChange(app.id, value);
            }}
            className="select-field ledger-num w-full rounded border border-ink/15 px-1.5 py-1 text-xs dark:border-white/15"
          />
        </label>
      )}

      <button
        type="button"
        onClick={() => onDelete(app.id)}
        className="mt-2 flex items-center gap-1 text-xs font-medium text-suspicious hover:underline"
      >
        <Trash2 className="h-3 w-3" strokeWidth={2} />
        Delete
      </button>
    </div>
  );
}

export default function ApplicationKanban({ applications, onStatusChange, onInterviewDateChange, onDelete }) {
  const [dragOverStatus, setDragOverStatus] = useState(null);

  function handleDragStart(e, id) {
    e.dataTransfer.setData('text/plain', id);
  }

  function handleDrop(e, status) {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    setDragOverStatus(null);
    onStatusChange(id, status);
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {APPLICATION_STATUSES.map((status) => {
        const jobs = applications.filter((a) => a.status === status);
        return (
          <div
            key={status}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverStatus(status);
            }}
            onDragLeave={() => setDragOverStatus(null)}
            onDrop={(e) => handleDrop(e, status)}
            className={`flex flex-col gap-2 rounded-card border p-2 transition-colors ${
              dragOverStatus === status
                ? 'border-brand bg-brand/5'
                : 'border-ink/10 bg-paper-dim dark:border-white/10 dark:bg-slate-900'
            }`}
          >
            <div className="flex items-center justify-between px-1">
              <StatusBadge status={status} />
              <span className="ledger-num text-xs text-ink-muted dark:text-slate-400">
                {jobs.length}
              </span>
            </div>
            {/* Capped to the viewport height and scrollable internally —
                without this, a column with many cards just kept growing
                the whole page taller instead of staying within view,
                which got unwieldy once a column had more than a
                handful of applications in it. The column header above
                stays put; only the card list scrolls. */}
            <div className="scrollbar-hide flex min-h-[3rem] max-h-[65vh] flex-col gap-2 overflow-y-auto pr-0.5">
              {jobs.map((app) => (
                <ApplicationKanbanCard
                  key={app.id}
                  app={app}
                  onDragStart={handleDragStart}
                  onDelete={onDelete}
                  onInterviewDateChange={onInterviewDateChange}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
