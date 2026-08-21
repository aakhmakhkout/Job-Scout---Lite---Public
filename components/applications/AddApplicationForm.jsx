'use client';

import { useState } from 'react';
import { APPLICATION_STATUSES } from './StatusBadge';

const EMPTY_FORM = {
  job_title: '',
  company: '',
  apply_url: '',
  status: 'Saved',
  applied_date: '',
  interview_date: '',
  notes: '',
};

export default function AddApplicationForm({ onAdd, onCancel }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.job_title.trim() || !form.company.trim()) return;
    setSaving(true);
    await onAdd({
      ...form,
      applied_date: form.applied_date || null,
      interview_date: form.interview_date || null,
      apply_url: form.apply_url || null,
      notes: form.notes || null,
    });
    setSaving(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 gap-3 rounded-card border border-ink/10 bg-white p-4 dark:border-white/10 dark:bg-slate-800 sm:grid-cols-2"
    >
      <label className="block text-sm sm:col-span-1">
        <span className="mb-1 block font-medium text-ink-soft dark:text-slate-300">
          Job title *
        </span>
        <input
          required
          value={form.job_title}
          onChange={(e) => update('job_title', e.target.value)}
          className="w-full rounded-md border border-ink/15 bg-transparent px-3 py-2 text-sm focus:border-brand dark:border-white/15"
        />
      </label>

      <label className="block text-sm sm:col-span-1">
        <span className="mb-1 block font-medium text-ink-soft dark:text-slate-300">
          Company *
        </span>
        <input
          required
          value={form.company}
          onChange={(e) => update('company', e.target.value)}
          className="w-full rounded-md border border-ink/15 bg-transparent px-3 py-2 text-sm focus:border-brand dark:border-white/15"
        />
      </label>

      <label className="block text-sm sm:col-span-2">
        <span className="mb-1 block font-medium text-ink-soft dark:text-slate-300">
          Apply URL
        </span>
        <input
          type="url"
          value={form.apply_url}
          onChange={(e) => update('apply_url', e.target.value)}
          placeholder="https://…"
          className="w-full rounded-md border border-ink/15 bg-transparent px-3 py-2 text-sm focus:border-brand dark:border-white/15"
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block font-medium text-ink-soft dark:text-slate-300">Status</span>
        <select
          value={form.status}
          onChange={(e) => update('status', e.target.value)}
          className="select-field w-full rounded-md border border-ink/15 px-3 py-2 text-sm dark:border-white/15"
        >
          {APPLICATION_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-sm">
        <span className="mb-1 block font-medium text-ink-soft dark:text-slate-300">
          Applied date
        </span>
        <input
          type="date"
          value={form.applied_date}
          onChange={(e) => update('applied_date', e.target.value)}
          className="w-full rounded-md border border-ink/15 bg-transparent px-3 py-2 text-sm dark:border-white/15"
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block font-medium text-ink-soft dark:text-slate-300">
          Interview date
        </span>
        <input
          type="datetime-local"
          value={form.interview_date}
          onChange={(e) => update('interview_date', e.target.value)}
          className="w-full rounded-md border border-ink/15 bg-transparent px-3 py-2 text-sm dark:border-white/15"
        />
      </label>

      <label className="block text-sm sm:col-span-2">
        <span className="mb-1 block font-medium text-ink-soft dark:text-slate-300">Notes</span>
        <textarea
          value={form.notes}
          onChange={(e) => update('notes', e.target.value)}
          rows={2}
          className="w-full rounded-md border border-ink/15 bg-transparent px-3 py-2 text-sm focus:border-brand dark:border-white/15"
        />
      </label>

      <div className="flex gap-2 sm:col-span-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-60"
        >
          {saving ? 'Adding…' : 'Add application'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-ink/15 px-4 py-2 text-sm font-medium hover:border-ink/30 dark:border-white/15"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
