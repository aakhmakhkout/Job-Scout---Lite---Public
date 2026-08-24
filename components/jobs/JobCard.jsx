'use client';

import { useState } from 'react';
import TrustDial from './TrustDial';
import SuspiciousBanner from './SuspiciousBanner';
import { useToast } from '@/components/ui/ToastProvider';

function timeAgo(isoString) {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const hours = Math.max(1, Math.round(diffMs / 3_600_000));
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

export default function JobCard({
  job,
  onBlock,
  initialSaved = false,
  initialSavedJobId = null,
  initialApplied = false,
  initialApplicationId = null,
}) {
  // Hydrated from the parent's fetch of the user's real saved-jobs and
  // applications lists (see JobsPageClient), not just local component
  // state — otherwise refreshing the page forgets what's already saved/
  // applied, and clicking "Mark applied" again creates a duplicate row
  // in the tracker instead of recognizing it's already tracked.
  const [saved, setSaved] = useState(initialSaved);
  const [savedJobId, setSavedJobId] = useState(initialSavedJobId);
  const [applied, setApplied] = useState(initialApplied);
  const [applicationId, setApplicationId] = useState(initialApplicationId);
  const [savePending, setSavePending] = useState(false);
  const [applyPending, setApplyPending] = useState(false);
  const [showReasons, setShowReasons] = useState(false);
  const { addToast } = useToast();

  async function handleSaveToggle() {
    setSavePending(true);
    try {
      if (!saved) {
        const res = await fetch('/api/saved-jobs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            job_apply_url: job.apply_url,
            job_title: job.title,
            job_company: job.company,
            job_location: job.location,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to save');
        setSavedJobId(data.saved_job.id);
        setSaved(true);
        addToast('Saved job');
      } else if (savedJobId) {
        const res = await fetch(`/api/saved-jobs/${savedJobId}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to remove');
        setSaved(false);
        setSavedJobId(null);
        addToast('Removed from saved');
      }
    } catch (e) {
      addToast(e.message === 'Failed to fetch' ? 'Log in to save jobs' : e.message, 'warning');
    } finally {
      setSavePending(false);
    }
  }

  async function handleAppliedToggle() {
    setApplyPending(true);
    try {
      if (!applied) {
        const res = await fetch('/api/applications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            job_title: job.title,
            company: job.company,
            apply_url: job.apply_url,
            status: 'Applied',
            applied_date: new Date().toISOString().slice(0, 10),
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to mark applied');
        setApplicationId(data.application.id);
        setApplied(true);
        addToast('Marked applied');
      } else if (applicationId) {
        const res = await fetch(`/api/applications/${applicationId}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to unmark');
        setApplied(false);
        setApplicationId(null);
        addToast('Unmarked as applied');
      }
    } catch (e) {
      addToast(
        e.message === 'Failed to fetch' ? 'Log in to track applications' : e.message,
        'warning'
      );
    } finally {
      setApplyPending(false);
    }
  }

  return (
    <div className="group rounded-card border border-ink/10 bg-white p-4 shadow-card transition-shadow hover:shadow-card-hover dark:border-white/10 dark:bg-slate-800">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold leading-tight">{job.title}</h3>
          <p className="mt-0.5 text-sm text-ink-soft dark:text-slate-300">{job.company}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-muted dark:text-slate-400">
            <span>{job.location}</span>
            <span aria-hidden="true">·</span>
            <span>{job.source}</span>
            <span aria-hidden="true">·</span>
            <span className="ledger-num">{timeAgo(job.posted_at)}</span>
          </div>
        </div>
        <TrustDial job={job} />
      </div>

      <div className="mt-1 flex items-center gap-3">
        {onBlock && (
          <button
            type="button"
            onClick={() => onBlock(job.company)}
            className="text-xs text-ink-muted underline decoration-dotted hover:text-suspicious dark:text-slate-500"
          >
            Block {job.company}
          </button>
        )}
        {Array.isArray(job.trust_reasons) && job.trust_reasons.length > 0 && (
          <button
            type="button"
            onClick={() => setShowReasons((v) => !v)}
            className="text-xs text-ink-muted underline decoration-dotted hover:text-brand dark:text-slate-500 dark:hover:text-brand-light"
          >
            {showReasons ? 'Hide score breakdown' : 'Why this score?'}
          </button>
        )}
      </div>

      {showReasons && (
        <ul className="mt-2 space-y-0.5 rounded-md bg-paper-dim px-3 py-2 text-xs text-ink-soft dark:bg-slate-900 dark:text-slate-300">
          {job.trust_reasons.map((reason, i) => (
            <li key={i} className="ledger-num">
              {reason}
            </li>
          ))}
        </ul>
      )}

      <p className="mt-3 text-sm leading-relaxed text-ink-soft dark:text-slate-300">
        {job.summary}
      </p>

      {job.is_suspicious === 1 && (
        <div className="mt-3">
          <SuspiciousBanner />
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-ink/5 pt-3 dark:border-white/5">
        <a
          href={job.apply_url}
          className="rounded-md bg-brand px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-brand-dark"
        >
          Apply
        </a>
        <button
          type="button"
          onClick={handleSaveToggle}
          disabled={savePending}
          aria-pressed={saved}
          className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-60 ${
            saved
              ? 'border-brand bg-brand/10 text-brand dark:text-brand-light'
              : 'border-ink/15 text-ink-soft hover:border-ink/30 dark:border-white/15 dark:text-slate-300 dark:hover:border-white/30'
          }`}
        >
          {saved ? 'Saved' : 'Save'}
        </button>
        <button
          type="button"
          onClick={handleAppliedToggle}
          disabled={applyPending}
          aria-pressed={applied}
          className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-60 ${
            applied
              ? 'border-good bg-good/10 text-good'
              : 'border-ink/15 text-ink-soft hover:border-ink/30 dark:border-white/15 dark:text-slate-300 dark:hover:border-white/30'
          }`}
        >
          {applied ? 'Marked applied' : 'Mark applied'}
        </button>
      </div>
    </div>
  );
}
