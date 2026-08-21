'use client';

import { useState } from 'react';

export default function BlocklistManager({ blockedCompanies, onAdd, onRemove }) {
  const [input, setInput] = useState('');
  const [open, setOpen] = useState(false);

  async function handleAdd(e) {
    e.preventDefault();
    const name = input.trim();
    if (!name) return;
    await onAdd(name);
    setInput('');
  }

  return (
    <div className="rounded-card border border-ink/10 bg-white dark:border-white/10 dark:bg-slate-800">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium"
      >
        <span>
          Blocked companies
          {blockedCompanies.length > 0 && (
            <span className="ledger-num ml-2 text-xs text-ink-muted dark:text-slate-400">
              ({blockedCompanies.length})
            </span>
          )}
        </span>
        <span className="text-ink-muted dark:text-slate-400">{open ? '−' : '+'}</span>
      </button>

      {open && (
        <div className="border-t border-ink/5 p-4 dark:border-white/5">
          <form onSubmit={handleAdd} className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Company name"
              className="flex-1 rounded-md border border-ink/15 bg-transparent px-3 py-1.5 text-sm placeholder:text-ink-muted focus:border-brand dark:border-white/15 dark:placeholder:text-slate-500"
            />
            <button
              type="submit"
              className="rounded-md bg-brand px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-dark"
            >
              Block
            </button>
          </form>

          {blockedCompanies.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {blockedCompanies.map((entry) => (
                <span
                  key={entry.id}
                  className="inline-flex items-center gap-1.5 rounded-full bg-suspicious/10 px-2.5 py-1 text-xs font-medium text-suspicious"
                >
                  {entry.company_name}
                  <button
                    type="button"
                    onClick={() => onRemove(entry.id)}
                    aria-label={`Unblock ${entry.company_name}`}
                    className="hover:opacity-70"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-xs text-ink-muted dark:text-slate-400">
              No companies blocked yet — jobs from blocked companies won't show in your feed.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
