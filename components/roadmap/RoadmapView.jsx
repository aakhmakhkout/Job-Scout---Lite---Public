'use client';

import { useState } from 'react';
import { Check, ChevronDown, ExternalLink, Circle } from 'lucide-react';

// Update 58 — Career Roadmap, sub-step 3. The interactive visual
// component that renders an already-annotated roadmap (from
// lib/roadmaps/index.js's annotateRoadmapWithProgress — every topic
// already has `learned: boolean`, every stage already has a
// `progress` summary). This component is purely presentational and
// generic — it doesn't know or care which role it's rendering, so the
// same component works for Frontend today and Backend/Data & ML/
// DevOps & Cloud/Mobile as their content lands in later sub-steps.
//
// Visual language, not roadmap.sh's (see Update 56 — that's legally
// off-limits to even resemble too closely via reused content, though
// the general "sequence of stages, each with topic boxes" idea is a
// generic enough UI pattern that it isn't anyone's IP): a vertical
// sequence of stage cards connected by a simple line, each stage
// holding its topics as clickable boxes. A topic's *tier*
// (must/important/optional) shows in its border weight and label; its
// *learned* state shows in fill color and icon — solid brand-colored
// with a checkmark when learned, muted/grayed with a plain circle
// outline when not. Clicking a topic expands it in place to show its
// blurb and a link to the one external resource for that topic.

const TIER_STYLES = {
  must: { label: 'Must-have', border: 'border-2', ring: 'ring-1 ring-brand/30' },
  important: { label: 'Important', border: 'border', ring: '' },
  optional: { label: 'Optional', border: 'border border-dashed', ring: '' },
};

function TopicBox({ topic }) {
  const [expanded, setExpanded] = useState(false);
  const tierStyle = TIER_STYLES[topic.tier] || TIER_STYLES.optional;

  return (
    <div
      className={`overflow-hidden rounded-md transition-colors ${tierStyle.border} ${tierStyle.ring} ${
        topic.learned
          ? 'border-brand/40 bg-brand/5 dark:border-brand-light/40 dark:bg-brand-light/5'
          : 'border-ink/15 bg-ink/[0.02] dark:border-white/15 dark:bg-white/[0.02]'
      }`}
    >
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left"
      >
        <div className="flex min-w-0 items-center gap-2">
          {topic.learned ? (
            <Check className="h-3.5 w-3.5 shrink-0 text-brand dark:text-brand-light" strokeWidth={3} />
          ) : (
            <Circle
              className="h-3 w-3 shrink-0 text-ink-muted dark:text-slate-500"
              strokeWidth={2.5}
            />
          )}
          <span
            className={`truncate text-sm font-medium ${
              topic.learned ? '' : 'text-ink-muted dark:text-slate-400'
            }`}
          >
            {topic.title}
          </span>
        </div>
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 text-ink-muted transition-transform dark:text-slate-500 ${
            expanded ? 'rotate-180' : ''
          }`}
          strokeWidth={2.25}
        />
      </button>

      {expanded && (
        <div className="border-t border-ink/10 px-3 py-2.5 dark:border-white/10">
          <p className="text-xs text-ink-muted dark:text-slate-400">{topic.blurb}</p>
          {topic.resource && (
            <a
              href={topic.resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline dark:text-brand-light"
            >
              {topic.resource.label}
              <ExternalLink className="h-3 w-3" strokeWidth={2.25} />
            </a>
          )}
        </div>
      )}
    </div>
  );
}

function StageCard({ stage, index, isLast }) {
  const { must, important, optional } = stage.progress;
  const totalLearned = must.learned + important.learned + optional.learned;
  const totalTopics = must.total + important.total + optional.total;

  return (
    <div className="relative flex gap-4">
      <div className="flex flex-col items-center">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
          {index + 1}
        </div>
        {!isLast && <div className="mt-1 w-px flex-1 bg-ink/10 dark:bg-white/10" />}
      </div>

      <div className="min-w-0 flex-1 pb-8">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <h3 className="text-sm font-semibold">{stage.title}</h3>
          <span className="text-xs text-ink-muted dark:text-slate-400">
            {totalLearned} of {totalTopics} known
            {must.total > 0 ? ` · ${must.learned}/${must.total} must-haves` : ''}
          </span>
        </div>
        {stage.description && (
          <p className="mt-1 text-xs text-ink-muted dark:text-slate-400">{stage.description}</p>
        )}

        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {stage.topics.map((topic) => (
            <TopicBox key={topic.id} topic={topic} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function RoadmapView({ roadmap }) {
  if (!roadmap) return null;

  const totals = roadmap.stages.reduce(
    (acc, stage) => {
      const { must, important, optional } = stage.progress;
      acc.learned += must.learned + important.learned + optional.learned;
      acc.total += must.total + important.total + optional.total;
      return acc;
    },
    { learned: 0, total: 0 }
  );

  return (
    <div>
      <div className="rounded-card border border-ink/10 bg-white p-5 dark:border-white/10 dark:bg-slate-800">
        <h2 className="text-lg font-semibold">{roadmap.role} roadmap</h2>
        <p className="mt-1 text-sm text-ink-muted dark:text-slate-400">{roadmap.description}</p>
        <p className="mt-2 text-xs font-medium text-brand dark:text-brand-light">
          {totals.learned} of {totals.total} topics already on your resume
        </p>
        <p className="mt-3 text-xs text-ink-muted dark:text-slate-400">
          Tap any box to see what it covers and where to learn it. Filled boxes are already on
          your resume; outlined ones aren't yet — tiers (must-have / important / optional) reflect
          what current job postings for this role actually ask for, not a strict order to follow.
        </p>
      </div>

      <div className="mt-6">
        {roadmap.stages.map((stage, i) => (
          <StageCard key={stage.id} stage={stage} index={i} isLast={i === roadmap.stages.length - 1} />
        ))}
      </div>
    </div>
  );
}
