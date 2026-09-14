'use client';

import { FileUp, X, RefreshCw, Check, AlertTriangle, ChevronDown, Map } from 'lucide-react';
import ResumeDetailedReport from './ResumeDetailedReport';
import { useResumeManager } from './useResumeManager';
import { AVAILABLE_ROADMAP_ROLES } from '@/lib/roadmaps';
import { isAtsFriendly } from '@/lib/resumeScore';
import { useState } from 'react';

// Update 60 — Career Roadmap, sub-step 5. Restructured into two
// layers, exactly as originally described: a compact summary (score,
// role, a quick ATS-friendly yes/no, the roadmap link) that's always
// visible, and a big detailed report underneath it — the formatting
// checks, section order, skills, and matched jobs already built in
// earlier updates — that only renders when explicitly expanded.
//
// Update 65 — the upload/fetch/remove logic (useResumeManager) and
// the detailed-report content (ResumeDetailedReport) are now shared
// with the Dashboard's own compact resume box
// (components/dashboard/ResumeSummaryBox.jsx) instead of being
// duplicated. This file is now specifically the /profile layout: full
// width, detail expands inline in the same card. The Dashboard's
// version looks different (a compact grid box, detail opens in a
// separate section below the grid) but shares the same underlying
// data and actions.

// A quick, compact yes/no companion to the numeric score — see
// lib/resumeScore.js's isAtsFriendly() for the actual logic, shared
// with the Dashboard's ResumeSummaryBox.

function ScoreReport({ report, roleInfo, atsFriendly }) {
  if (!report || report.score === null) return null;
  const { score, label } = report;

  const scoreColor =
    score >= 90
      ? 'text-emerald-600 dark:text-emerald-400'
      : score >= 75
        ? 'text-brand dark:text-brand-light'
        : score >= 60
          ? 'text-amber-600 dark:text-amber-400'
          : 'text-suspicious';

  return (
    <div className="mt-3 rounded-md border border-ink/10 bg-ink/[0.02] p-3 dark:border-white/10 dark:bg-white/[0.02]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`text-3xl font-bold leading-none ${scoreColor}`}>{score}</div>
          <div>
            <p className="text-sm font-semibold">{label}</p>
            <p className="text-xs text-ink-muted dark:text-slate-400">Resume score, out of 100</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {atsFriendly !== null && (
            <span
              className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                atsFriendly
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
              }`}
            >
              {atsFriendly ? <Check className="h-3 w-3" strokeWidth={3} /> : <AlertTriangle className="h-3 w-3" strokeWidth={2.5} />}
              {atsFriendly ? 'ATS-friendly' : 'ATS issues found'}
            </span>
          )}
          {roleInfo?.primaryRole && (
            <span className="shrink-0 rounded-full bg-brand/10 px-2.5 py-1 text-xs font-semibold text-brand dark:text-brand-light">
              {roleInfo.primaryRole}
              {!roleInfo.isSingleRole && roleInfo.roles.length > 1 ? ' +' : ''}
            </span>
          )}
        </div>
      </div>

      {roleInfo?.primaryRole && roleInfo.roles.some((r) => AVAILABLE_ROADMAP_ROLES.includes(r.role)) && (
        <a
          href={
            roleInfo.isSingleRole
              ? `/roadmap?role=${encodeURIComponent(roleInfo.primaryRole)}`
              : '/roadmap'
          }
          className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-dark"
        >
          <Map className="h-3.5 w-3.5" strokeWidth={2.25} />
          {roleInfo.isSingleRole
            ? `Check your ${roleInfo.primaryRole} roadmap`
            : 'Check your roadmap'}
        </a>
      )}
    </div>
  );
}

export default function ResumeUploadCard() {
  const { resume, loading, uploading, removing, fileInputRef, handleFileSelected, handleRemove } =
    useResumeManager();
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="rounded-card border border-ink/10 bg-white p-5 dark:border-white/10 dark:bg-slate-800">
      <h2 className="text-sm font-semibold">Resume</h2>
      <p className="mt-1 text-sm text-ink-muted dark:text-slate-400">
        Upload a PDF or DOCX and we'll score it, check its formatting, pull out the skills we
        recognize, and show jobs from the live cache that match those skills — no AI involved,
        just rule-based checks and keyword matching throughout.
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx"
        onChange={handleFileSelected}
        className="hidden"
      />

      <div className="mt-3">
        {loading ? (
          <div className="h-10 animate-pulse rounded-md bg-ink/10 dark:bg-white/10" />
        ) : (
          <>
            {resume ? (
              <div className="rounded-md border border-ink/10 p-3 dark:border-white/10">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{resume.file_name}</p>
                    <p className="mt-0.5 text-xs text-ink-muted dark:text-slate-400">
                      Uploaded{' '}
                      {new Date(resume.uploaded_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemove}
                    disabled={removing}
                    className="flex shrink-0 items-center gap-1 rounded-md border border-suspicious/30 px-2 py-1 text-xs font-medium text-suspicious hover:bg-suspicious/10 disabled:opacity-50"
                  >
                    <X className="h-3 w-3" strokeWidth={2.5} />
                    Remove
                  </button>
                </div>

                <ScoreReport
                  report={resume.report}
                  roleInfo={resume.roleInfo}
                  atsFriendly={isAtsFriendly(resume.ats_checks)}
                />

                <button
                  type="button"
                  onClick={() => setShowDetails((d) => !d)}
                  className="mt-3 flex w-full items-center justify-between rounded-md border border-ink/10 px-3 py-2 text-xs font-medium text-ink-soft hover:bg-ink/5 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
                >
                  {showDetails ? 'Hide detailed report' : 'View detailed report'}
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform ${showDetails ? 'rotate-180' : ''}`}
                    strokeWidth={2.25}
                  />
                </button>

                {showDetails && (
                  <div className="mt-3 border-t border-ink/10 pt-3 dark:border-white/10">
                    <ResumeDetailedReport resume={resume} />
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-ink-muted underline decoration-dotted hover:text-brand disabled:opacity-60 dark:text-slate-400 dark:hover:text-brand-light"
                >
                  <RefreshCw className="h-3 w-3" strokeWidth={2.5} />
                  {uploading ? 'Uploading…' : 'Replace with a different file'}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-ink/20 px-3 py-2 text-sm font-medium text-ink-soft hover:border-brand/40 hover:text-brand disabled:opacity-60 dark:border-white/20 dark:text-slate-300"
              >
                <FileUp className="h-4 w-4" strokeWidth={2.25} />
                {uploading ? 'Uploading…' : 'Upload resume (PDF or DOCX, up to 4MB)'}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
