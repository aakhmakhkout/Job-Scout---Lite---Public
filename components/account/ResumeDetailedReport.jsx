'use client';

import Link from 'next/link';
import { Check, AlertTriangle, Minus, Sparkles, ArrowRight } from 'lucide-react';

// Update 65 — extracted from components/account/ResumeUploadCard.jsx
// so the Dashboard's separate below-the-grid report section
// (rendered by components/dashboard/ResourcesGridSection.jsx) and the
// Profile page's inline expandable section can share one
// implementation. Nothing here is new content — same tips, skills,
// formatting checks, section order, and matched jobs as before this
// extraction, just relocated so it isn't duplicated.

function TipsList({ tips }) {
  return tips.length > 0 ? (
    <div className="space-y-1.5">
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
    <p className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
      <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
      Nothing major to flag — nice work.
    </p>
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
    <div className="border-t border-ink/10 pt-3 dark:border-white/10">
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

export default function ResumeDetailedReport({ resume }) {
  if (!resume) return null;
  return (
    <div className="space-y-3">
      <TipsList tips={resume.report?.tips || []} />

      {resume.extracted_skills.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
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
        <p className="text-xs text-ink-muted dark:text-slate-400">
          Didn't recognize any skills from our list in this file — that's a limitation of
          keyword matching, not necessarily your resume.
        </p>
      )}

      <AtsChecksSummary checks={resume.ats_checks} />

      {/* Update 72 — was an inline list of up to 5 matched jobs
          (ResumeJobMatches.jsx, now deleted) rendered right here.
          Replaced with a single link into the Jobs page's existing
          resumeMatch=1 mode (built in Update 54 for the post-signup
          prompt, ResumeOnboardingPrompt.jsx) — same matching engine,
          same /api/resume/matches endpoint, just one shared surface
          for "show me jobs matching my resume" instead of two. */}
      <Link
        href="/jobs?resumeMatch=1"
        className="flex items-center justify-between gap-2 rounded-md border border-brand/30 bg-brand/5 px-3 py-2.5 text-sm font-medium text-brand transition-colors hover:bg-brand/10 dark:border-brand-light/30 dark:bg-brand-light/5 dark:text-brand-light"
      >
        <span className="flex items-center gap-1.5">
          <Sparkles className="h-4 w-4" strokeWidth={2.25} />
          Matching jobs
        </span>
        <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.25} />
      </Link>
    </div>
  );
}
