'use client';

import { useState } from 'react';

const STATUS_STYLES = {
  pending: 'bg-review/10 text-review',
  duplicate: 'bg-review/10 text-review',
  approved: 'bg-trusted/10 text-trusted',
  rejected: 'bg-suspicious/10 text-suspicious',
};

export default function ImportReviewClient({ importId, initialItems }) {
  const [items, setItems] = useState(initialItems);
  const [busyId, setBusyId] = useState(null);
  const [errorById, setErrorById] = useState({});

  async function handleAction(itemId, action) {
    setBusyId(itemId);
    setErrorById((prev) => ({ ...prev, [itemId]: '' }));

    let res;
    try {
      res = await fetch(`/api/admin/imports/${importId}/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
    } catch {
      setBusyId(null);
      setErrorById((prev) => ({ ...prev, [itemId]: 'Could not reach the server.' }));
      return;
    }

    const data = await res.json().catch(() => ({}));
    setBusyId(null);

    if (!res.ok) {
      setErrorById((prev) => ({ ...prev, [itemId]: data.error || 'Action failed' }));
      return;
    }

    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, status: data.status } : item))
    );
  }

  return (
    <div className="mt-6 space-y-4">
      {items.length === 0 && (
        <p className="text-sm text-ink-muted dark:text-slate-400">No items in this import.</p>
      )}

      {items.map((item) => {
        const isReviewed = item.status === 'approved' || item.status === 'rejected';
        const hasErrors = item.validation_errors && item.validation_errors.length > 0;
        const isDuplicate = item.status === 'duplicate';
        const canApprove = !hasErrors && !isDuplicate && !isReviewed;

        return (
          <div
            key={item.id}
            className="rounded-card border border-ink/10 bg-white p-4 shadow-card dark:border-white/10 dark:bg-slate-800"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">{item.raw_payload?.title || '(no title)'}</p>
                <p className="text-sm text-ink-muted dark:text-slate-400">
                  {item.raw_payload?.company || '(no company)'}
                  {item.raw_payload?.location ? ` · ${item.raw_payload.location}` : ''}
                </p>
              </div>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[item.status] || ''}`}>
                {item.status}
              </span>
            </div>

            {item.raw_payload?.apply_url && (
              <a
                href={item.raw_payload.apply_url}
                target="_blank"
                rel="noreferrer"
                className="mt-2 block break-all text-xs text-brand hover:underline"
              >
                {item.raw_payload.apply_url}
              </a>
            )}

            {hasErrors && (
              <div className="mt-2 rounded-md bg-suspicious/10 px-3 py-2 text-xs text-suspicious">
                <p className="font-medium">Validation errors — can only reject:</p>
                <ul className="mt-1 list-disc pl-4">
                  {item.validation_errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {isDuplicate && (
              <p className="mt-2 rounded-md bg-review/10 px-3 py-2 text-xs text-review">
                Matches an existing job by apply_url — can only reject here.
              </p>
            )}

            {errorById[item.id] && (
              <p className="mt-2 rounded-md bg-suspicious/10 px-3 py-2 text-xs text-suspicious">
                {errorById[item.id]}
              </p>
            )}

            {!isReviewed && (
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  disabled={!canApprove || busyId === item.id}
                  onClick={() => handleAction(item.id, 'approve')}
                  className="rounded-md bg-brand px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Approve
                </button>
                <button
                  type="button"
                  disabled={busyId === item.id}
                  onClick={() => handleAction(item.id, 'reject')}
                  className="rounded-md border border-ink/15 px-3 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:bg-ink/5 disabled:opacity-40 dark:border-white/15 dark:text-slate-300 dark:hover:bg-white/5"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
