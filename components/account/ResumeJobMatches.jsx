'use client';

import { useEffect, useState } from 'react';
import { ExternalLink, Sparkles } from 'lucide-react';

// Update 53 — Resume Intelligence, step 5. Shows the top jobs matched
// against the current resume's skills. This is the matching *engine*
// getting its first visible surface — step 6 (onboarding) and step 7
// (Dashboard) give this a more prominent home later; for now it's a
// compact list right here on /profile, right below the resume that
// produced it.
//
// Deliberately lightweight compared to the full JobCard used on the
// Jobs page (no save/apply actions, no admin controls) — those need
// per-job saved/applied state hydrated from the database, which is
// more than this compact "here's what matched" view needs. Each
// result links straight to the listing itself.

function timeAgo(isoString) {
  if (!isoString) return null;
  const diffMs = Date.now() - new Date(isoString).getTime();
  const hours = Math.max(1, Math.round(diffMs / 3_600_000));
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export default function ResumeJobMatches() {
  const [state, setState] = useState({ loading: true, matches: [], isFallback: false, reason: null });

  useEffect(() => {
    let cancelled = false;
    fetch('/api/resume/matches')
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) {
          setState({
            loading: false,
            matches: data.matches || [],
            isFallback: data.isFallback,
            reason: data.reason,
          });
        }
      })
      .catch(() => {
        if (!cancelled) setState((s) => ({ ...s, loading: false }));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (state.loading) {
    return <div className="mt-3 h-16 animate-pulse rounded-md bg-ink/10 dark:bg-white/10" />;
  }

  if (state.reason === 'no-jobs') {
    // Nothing eligible in the cache at all right now — not a resume
    // problem, so no reason to make it sound like one.
    return null;
  }

  if (state.matches.length === 0) return null;

  return (
    <div className="border-t border-ink/10 pt-3 dark:border-white/10">
      <div className="flex items-center gap-1.5">
        <Sparkles className="h-3.5 w-3.5 text-brand dark:text-brand-light" strokeWidth={2.25} />
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted dark:text-slate-400">
          {state.isFallback ? 'Closest jobs we found' : 'Jobs matching your skills'}
        </p>
      </div>

      {state.isFallback && (
        <p className="mt-1 text-xs text-ink-muted dark:text-slate-400">
          Nothing lined up closely with your specific skills right now, but these are the
          nearest matches available.
        </p>
      )}

      <div className="mt-2 space-y-2">
        {state.matches.slice(0, 5).map((match) => (
          <a
            key={match.apply_url}
            href={match.apply_url}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-md border border-ink/10 p-2.5 transition hover:border-brand/40 dark:border-white/10"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold">{match.title}</p>
                <p className="mt-0.5 truncate text-xs text-ink-muted dark:text-slate-400">
                  {match.company}
                  {match.location ? ` · ${match.location}` : ''}
                  {timeAgo(match.posted_at) ? ` · ${timeAgo(match.posted_at)}` : ''}
                </p>
              </div>
              <ExternalLink
                className="mt-0.5 h-3 w-3 shrink-0 text-ink-muted dark:text-slate-500"
                strokeWidth={2.25}
              />
            </div>

            {match.matchedSkills.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {match.matchedSkills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-medium text-brand dark:text-brand-light"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </a>
        ))}
      </div>
    </div>
  );
}
