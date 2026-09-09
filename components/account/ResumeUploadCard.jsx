'use client';

import { useEffect, useRef, useState } from 'react';
import { FileUp, X, RefreshCw, Check, AlertTriangle, Minus } from 'lucide-react';
import { useToast } from '@/components/ui/ToastProvider';

// Update 47 — Resume Intelligence, step 1. This card lives on
// /profile for now — it's temporary real estate: step 6 of the
// roadmap (tracked in updates.md) moves the upload entry point into
// onboarding, and step 7 gives it a proper full-width home on the
// Dashboard itself. This is deliberately just "upload it, see what we
// found" for now, nothing more.
//
// Update 49 added the "Formatting checks" section below — step 2 of
// the roadmap. These are raw findings, shown plainly (a checkmark, a
// warning, or "not checked for this file type") — NOT yet a polished
// score or a tips list. That's step 4's job, once there's enough
// combined raw material (this step + step 3) to turn into one real
// report.
//
// Update 51 added the "Section order" block — step 3. Worth saying in
// the UI itself, not just the code comments: most ATS software
// doesn't actually care what order your sections are in, it just
// looks for headers as anchors. This is about what's easiest for a
// human skimming quickly, not a parsing requirement — so it's shown
// as a suggestion, not a pass/fail.
//
// Update 52 added the actual headline: a 0–100 score and a priority-
// ordered tips list (lib/resumeScore.js), combining steps 2 and 3 into
// something that reads like a real report instead of a checklist. The
// detailed pass/fail breakdown below it still exists — the score is a
// summary of it, not a replacement for it.

function ScoreReport({ report }) {
  if (!report || report.score === null) return null;
  const { score, label, tips } = report;

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
      <div className="flex items-center gap-3">
        <div className={`text-3xl font-bold leading-none ${scoreColor}`}>{score}</div>
        <div>
          <p className="text-sm font-semibold">{label}</p>
          <p className="text-xs text-ink-muted dark:text-slate-400">Resume score, out of 100</p>
        </div>
      </div>

      {tips.length > 0 ? (
        <div className="mt-3 space-y-1.5 border-t border-ink/10 pt-3 dark:border-white/10">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted dark:text-slate-400">
            Tips, most impactful first
          </p>
          {tips.map((tip) => (
            <div key={tip} className="flex items-start gap-1.5 text-xs">
              <AlertTriangle
                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400"
                strokeWidth={2.5}
              />
              <span>{tip}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 flex items-center gap-1.5 border-t border-ink/10 pt-3 text-xs text-emerald-600 dark:border-white/10 dark:text-emerald-400">
          <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
          Nothing major to flag — nice work.
        </p>
      )}
    </div>
  );
}

function CheckRow({ ok, label, detail }) {
  const Icon = ok === null ? Minus : ok ? Check : AlertTriangle;
  const color =
    ok === null
      ? 'text-ink-muted dark:text-slate-500'
      : ok
        ? 'text-emerald-600 dark:text-emerald-400'
        : 'text-amber-600 dark:text-amber-400';
  return (
    <div className="flex items-start gap-2 py-1">
      <Icon className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${color}`} strokeWidth={2.5} />
      <div>
        <span className="text-xs font-medium">{label}</span>
        {detail && <span className="ml-1 text-xs text-ink-muted dark:text-slate-400">{detail}</span>}
      </div>
    </div>
  );
}

function SectionOrderBlock({ sectionOrder }) {
  if (!sectionOrder) return null;
  const { detectedOrder, recommendedOrder, matchesRecommended, issues } = sectionOrder;

  return (
    <div className="mt-3 border-t border-ink/10 pt-3 dark:border-white/10">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted dark:text-slate-400">
        Section order
      </p>

      {detectedOrder.length < 2 ? (
        <p className="mt-1.5 text-xs text-ink-muted dark:text-slate-400">
          Not enough clearly-labeled sections found to check order (needs at least 2 of Summary,
          Skills, Experience, or Education on their own header line).
        </p>
      ) : (
        <>
          <p className="mt-1.5 text-xs">
            <span className="text-ink-muted dark:text-slate-400">Yours: </span>
            <span className="font-medium">{detectedOrder.join(' → ')}</span>
          </p>
          <p className="mt-0.5 text-xs">
            <span className="text-ink-muted dark:text-slate-400">Common convention: </span>
            <span className="text-ink-muted dark:text-slate-400">{recommendedOrder.join(' → ')}</span>
          </p>

          {matchesRecommended ? (
            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
              <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
              Matches the common convention
            </div>
          ) : (
            <div className="mt-1.5 space-y-1">
              {issues.map((issue) => (
                <div
                  key={issue}
                  className="flex items-start gap-1.5 text-xs text-amber-600 dark:text-amber-400"
                >
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={2.5} />
                  {issue}
                </div>
              ))}
            </div>
          )}
          <p className="mt-1.5 text-xs italic text-ink-muted dark:text-slate-400">
            Most ATS software doesn't actually require a specific order — this is about what's
            easiest for a human reviewer to skim quickly, not a parsing requirement.
          </p>
        </>
      )}
    </div>
  );
}

function AtsChecksSummary({ checks }) {
  if (!checks) return null;
  const { wordCount, sections, sectionOrder, contactInfo, bullets, structure } = checks;

  return (
    <div className="mt-4 border-t border-ink/10 pt-3 dark:border-white/10">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted dark:text-slate-400">
        Formatting checks
      </p>
      <p className="mt-1 text-xs text-ink-muted dark:text-slate-400">
        The detail behind the score above — every individual check, shown plainly.
      </p>

      <div className="mt-2 grid gap-x-4 sm:grid-cols-2">
        <CheckRow
          ok={wordCount.status === 'ok'}
          label={`${wordCount.count} words`}
          detail={
            wordCount.status === 'too-short'
              ? '— on the short side for most resumes'
              : wordCount.status === 'too-long'
                ? '— quite long; consider trimming'
                : ''
          }
        />
        <CheckRow ok={contactInfo.hasEmail} label="Email address found" />
        <CheckRow ok={contactInfo.hasPhone} label="Phone number found" />
        <CheckRow
          ok={bullets.total > 0 ? bullets.actionVerbCount / bullets.total >= 0.6 : null}
          label={
            bullets.total > 0
              ? `${bullets.actionVerbCount} of ${bullets.total} bullets start with a strong action verb`
              : 'No bullet points detected'
          }
        />
        <CheckRow ok={sections.hasSummary} label="Summary / objective section" />
        <CheckRow ok={sections.hasSkills} label="Skills section" />
        <CheckRow ok={sections.hasExperience} label="Experience section" />
        <CheckRow ok={sections.hasEducation} label="Education section" />

        {structure.checked ? (
          <>
            <CheckRow
              ok={!structure.hasTables}
              label={structure.hasTables ? 'Uses tables' : 'No tables'}
              detail={structure.hasTables ? '— some ATS parsers misread table content' : ''}
            />
            <CheckRow
              ok={!structure.hasTextBoxes}
              label={structure.hasTextBoxes ? 'Uses text boxes' : 'No text boxes'}
              detail={structure.hasTextBoxes ? '— content inside these is often invisible to an ATS' : ''}
            />
            <CheckRow
              ok={!structure.hasImages}
              label={structure.hasImages ? 'Contains an image' : 'No images'}
            />
          </>
        ) : (
          <CheckRow
            ok={null}
            label="Table/image/text-box checks"
            detail={
              structure.pageCount
                ? `not available for PDF yet — ${structure.pageCount} page${structure.pageCount === 1 ? '' : 's'} detected`
                : 'not available for PDF yet'
            }
          />
        )}
      </div>

      <SectionOrderBlock sectionOrder={sectionOrder} />
    </div>
  );
}

export default function ResumeUploadCard() {
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const fileInputRef = useRef(null);
  const { addToast } = useToast();

  useEffect(() => {
    let cancelled = false;
    fetch('/api/resume')
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setResume(data.resume || null);
      })
      .catch(() => {
        if (!cancelled) addToast("Couldn't load your resume status", 'warning');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleFileSelected(e) {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file later
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('resume', file);
      const res = await fetch('/api/resume', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok || !data.resume) throw new Error(data.error || 'Failed to upload resume');
      setResume(data.resume);
      const scoreNote = data.resume.report?.score != null ? ` — scored ${data.resume.report.score}/100` : '';
      addToast(
        data.resume.extracted_skills.length > 0
          ? `Resume uploaded${scoreNote} — found ${data.resume.extracted_skills.length} skill${
              data.resume.extracted_skills.length === 1 ? '' : 's'
            }`
          : `Resume uploaded${scoreNote} — didn't recognize any skills from our list, but it's saved`
      );
    } catch (err) {
      addToast(err.message || 'Could not upload resume', 'warning');
    } finally {
      setUploading(false);
    }
  }

  async function handleRemove() {
    setRemoving(true);
    try {
      const res = await fetch('/api/resume', { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to remove resume');
      setResume(null);
      addToast('Resume removed');
    } catch {
      addToast('Could not remove resume', 'warning');
    } finally {
      setRemoving(false);
    }
  }

  return (
    <div className="rounded-card border border-ink/10 bg-white p-5 dark:border-white/10 dark:bg-slate-800">
      <h2 className="text-sm font-semibold">Resume</h2>
      <p className="mt-1 text-sm text-ink-muted dark:text-slate-400">
        Upload a PDF or DOCX and we'll score it, check its formatting, and pull out the skills we
        recognize — no AI involved, just rule-based checks and keyword matching against a
        curated list. Matching you to jobs based on your skills is coming in a later update.
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

                <ScoreReport report={resume.report} />

                {resume.extracted_skills.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {resume.extracted_skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-medium text-brand dark:text-brand-light"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-xs text-ink-muted dark:text-slate-400">
                    Didn't recognize any skills from our list in this file — that's a limitation
                    of keyword matching, not necessarily your resume.
                  </p>
                )}

                <AtsChecksSummary checks={resume.ats_checks} />

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
