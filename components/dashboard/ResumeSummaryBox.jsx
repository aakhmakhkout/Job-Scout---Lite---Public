'use client';

import { FileUp, RefreshCw, Check, AlertTriangle, Map, ChevronDown } from 'lucide-react';
import ScoreRing from '@/components/account/ScoreRing';
import { isAtsFriendly } from '@/lib/resumeScore';
import { AVAILABLE_ROADMAP_ROLES } from '@/lib/roadmaps';

// Update 65 — the Dashboard's Resume review box, sized and styled to
// match ResourceCategoryBox so it sits naturally as the third card in
// the "Resources & prep" grid instead of living in its own separate
// full-width row (which is what Update 55 originally shipped, and
// what left an empty-looking third grid slot where Interview prep
// used to be).
//
// Deliberately more compact and more graphical than the /profile
// version (components/account/ResumeUploadCard.jsx) — a circular
// score ring instead of a big number, role/ATS badges instead of a
// paragraph, and both the roadmap link and the detail toggle as real
// buttons rather than text links, so the card reads as confidently
// "designed" rather than sparse next to the other two boxes' denser
// list content.
//
// Clicking "View detailed report" does NOT expand inline in this
// card — unlike the /profile version, the Dashboard's detailed report
// renders as its own separate section below the whole grid (see
// components/dashboard/ResourcesGridSection.jsx, which owns the
// showDetails state and passes it down here as a prop) since that's
// where there's actually room for it.
//
// Update 66 added the points-breakdown bars below the badges — the
// same 4 scoring categories from lib/resumeScore.js's breakdown
// (Contact & sections, Formatting & structure, Bullets & wording,
// Length), each shown as "earned/possible" with a small progress bar.
// Added specifically because the card still looked sparse next to its
// two list-heavy siblings even with the score ring and badges.
export default function ResumeSummaryBox({
  title,
  description,
  resume,
  loading,
  uploading,
  removing,
  showDetails,
  onToggleDetails,
  onFileSelected,
  onRemove,
  fileInputRef,
}) {
  const atsFriendly = resume ? isAtsFriendly(resume.ats_checks) : null;
  const roleInfo = resume?.roleInfo;
  const score = resume?.report?.score;

  return (
    <div className="rounded-card border border-ink/10 bg-white p-5 shadow-card dark:border-white/10 dark:bg-slate-800">
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-1 text-xs text-ink-muted dark:text-slate-400">{description}</p>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx"
        onChange={onFileSelected}
        className="hidden"
      />

      <div className="mt-4">
        {loading ? (
          <div className="h-24 animate-pulse rounded-md bg-ink/10 dark:bg-white/10" />
        ) : resume ? (
          <div>
            <div className="flex items-center gap-3">
              {score != null && <ScoreRing score={score} />}
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium">{resume.file_name}</p>
                <p className="mt-0.5 text-xs text-ink-muted dark:text-slate-400">
                  Uploaded{' '}
                  {new Date(resume.uploaded_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {roleInfo?.primaryRole && (
                    <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[11px] font-semibold text-brand dark:text-brand-light">
                      {roleInfo.primaryRole}
                      {!roleInfo.isSingleRole && roleInfo.roles.length > 1 ? ' +' : ''}
                    </span>
                  )}
                  {atsFriendly !== null && (
                    <span
                      className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        atsFriendly
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {atsFriendly ? (
                        <Check className="h-2.5 w-2.5" strokeWidth={3} />
                      ) : (
                        <AlertTriangle className="h-2.5 w-2.5" strokeWidth={2.5} />
                      )}
                      {atsFriendly ? 'ATS-friendly' : 'ATS issues'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {resume.report?.breakdown?.length > 0 && (
              <div className="mt-4 space-y-1.5 border-t border-ink/10 pt-3 dark:border-white/10">
                {resume.report.breakdown.map((cat) => {
                  const pct = cat.possible > 0 ? cat.earned / cat.possible : 0;
                  const barColor =
                    pct >= 0.9 ? 'bg-emerald-500' : pct >= 0.6 ? 'bg-brand' : 'bg-amber-500';
                  return (
                    <div key={cat.label}>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-ink-soft dark:text-slate-300">{cat.label}</span>
                        <span className="font-medium text-ink-muted dark:text-slate-400">
                          {cat.earned}/{cat.possible}
                        </span>
                      </div>
                      <div className="mt-0.5 h-1 overflow-hidden rounded-full bg-ink/10 dark:bg-white/10">
                        <div
                          className={`h-full rounded-full ${barColor}`}
                          style={{ width: `${Math.round(pct * 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-4 space-y-2">
              {roleInfo?.primaryRole && roleInfo.roles.some((r) => AVAILABLE_ROADMAP_ROLES.includes(r.role)) && (
                <a
                  href={
                    roleInfo.isSingleRole
                      ? `/roadmap?role=${encodeURIComponent(roleInfo.primaryRole)}`
                      : '/roadmap'
                  }
                  className="flex w-full items-center justify-center gap-1.5 rounded-md bg-brand px-3 py-2 text-xs font-semibold text-white hover:bg-brand-dark"
                >
                  <Map className="h-3.5 w-3.5" strokeWidth={2.25} />
                  Check your roadmap
                </a>
              )}

              <button
                type="button"
                onClick={onToggleDetails}
                className="flex w-full items-center justify-center gap-1.5 rounded-md border border-ink/10 px-3 py-2 text-xs font-medium text-ink-soft hover:bg-ink/5 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
              >
                {showDetails ? 'Hide detailed report' : 'View detailed report'}
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform ${showDetails ? 'rotate-180' : ''}`}
                  strokeWidth={2.25}
                />
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex w-full items-center justify-center gap-1.5 text-xs font-medium text-ink-muted underline decoration-dotted hover:text-brand disabled:opacity-60 dark:text-slate-400 dark:hover:text-brand-light"
              >
                <RefreshCw className="h-3 w-3" strokeWidth={2.5} />
                {uploading ? 'Uploading…' : removing ? 'Removing…' : 'Replace with a different file'}
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed border-ink/20 px-3 py-8 text-center text-xs font-medium text-ink-soft hover:border-brand/40 hover:text-brand disabled:opacity-60 dark:border-white/20 dark:text-slate-300"
          >
            <FileUp className="h-5 w-5" strokeWidth={2} />
            {uploading ? 'Uploading…' : 'Upload your resume for an instant score, tips, and job matches'}
          </button>
        )}
      </div>
    </div>
  );
}
