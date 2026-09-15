import Link from 'next/link';
import { ArrowLeft, Map, ArrowRight, Clock } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import EmptyState from '@/components/ui/EmptyState';
import RoadmapView from '@/components/roadmap/RoadmapView';
import { getViewer } from '@/lib/viewer';
import { inferRoles } from '@/lib/roleInference';
import { getRoadmapForRole, annotateRoadmapWithProgress, AVAILABLE_ROADMAP_ROLES } from '@/lib/roadmaps';

export const dynamic = 'force-dynamic';

// Update 59 — Career Roadmap, sub-step 4. The "smart" routing the
// original ask described: a resume that only matches one role goes
// straight to that role's roadmap (unchanged from Update 58's
// behavior); a resume that genuinely matches more than one role
// (inferRoles() already only reports a second role when its score is
// a real contender, not a token match — see lib/roleInference.js)
// gets a picker instead of a silent, arbitrary choice between them.
//
// The picker only appears when NO `?role=` is on the URL — once a
// role's chosen (from the picker, from the resume card's direct link
// for a single-role resume, or from a hand-typed URL), that choice is
// always honored directly. This also means bookmarking or sharing a
// specific `?role=Frontend` link always works predictably, regardless
// of how many roles that visitor's own resume happens to match.
export default async function RoadmapPage({ searchParams }) {
  const viewer = await getViewer();
  const isAdmin = viewer.kind === 'admin';

  let resumeSkills = [];
  if (!isAdmin) {
    const { data } = await viewer.supabase
      .from('resumes')
      .select('extracted_skills')
      .eq('user_id', viewer.user.id)
      .maybeSingle();
    resumeSkills = data?.extracted_skills || [];
  }

  const roleFromQuery = typeof searchParams?.role === 'string' ? searchParams.role : null;
  const inferred = inferRoles(resumeSkills);

  // Show the picker only when the visitor didn't already pick a role
  // AND there's a genuine choice to make (2+ real candidates) — a
  // resume matching just one role, or none at all, never sees this.
  const showPicker = !roleFromQuery && inferred.roles.length > 1;

  const role = roleFromQuery || (showPicker ? null : inferred.primaryRole);
  const rawRoadmap = role ? getRoadmapForRole(role) : null;
  const roadmap = rawRoadmap ? annotateRoadmapWithProgress(rawRoadmap, resumeSkills) : null;

  return (
    <AppShell title="Career roadmap" subtitle="A learning path matched to your resume" icon={Map}>
      <Link href="/profile" className="inline-flex items-center gap-1.5 text-sm text-brand hover:underline">
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2.25} />
        Back to Profile
      </Link>

      <div className="mt-4">
        {showPicker ? (
          <div>
            <h2 className="text-sm font-semibold">Your resume matches more than one role</h2>
            <p className="mt-1 text-sm text-ink-muted dark:text-slate-400">
              Pick the one you want a roadmap for — you can always come back and check another.
            </p>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {inferred.roles.map(({ role: candidateRole, matchedSkills }) => {
                const available = AVAILABLE_ROADMAP_ROLES.includes(candidateRole);
                const content = (
                  <>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold">{candidateRole}</span>
                      {available ? (
                        <ArrowRight className="h-4 w-4 text-brand dark:text-brand-light" strokeWidth={2.25} />
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-ink-muted dark:text-slate-400">
                          <Clock className="h-3 w-3" strokeWidth={2.25} />
                          Coming soon
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-ink-muted dark:text-slate-400">
                      Matched on {matchedSkills.slice(0, 4).join(', ')}
                      {matchedSkills.length > 4 ? `, +${matchedSkills.length - 4} more` : ''}
                    </p>
                  </>
                );
                return available ? (
                  <Link
                    key={candidateRole}
                    href={`/roadmap?role=${encodeURIComponent(candidateRole)}`}
                    className="rounded-card border border-ink/10 bg-white p-4 transition hover:border-brand/40 dark:border-white/10 dark:bg-slate-800"
                  >
                    {content}
                  </Link>
                ) : (
                  <div
                    key={candidateRole}
                    className="rounded-card border border-ink/10 bg-white p-4 opacity-60 dark:border-white/10 dark:bg-slate-800"
                  >
                    {content}
                  </div>
                );
              })}
            </div>
          </div>
        ) : !role ? (
          <EmptyState
            title="Upload a resume first"
            description="We match roadmap progress to the skills on your resume — upload one from your Profile page to see your roadmap."
          />
        ) : !roadmap ? (
          <EmptyState
            title={`The ${role} roadmap isn't built yet`}
            description={`Only ${AVAILABLE_ROADMAP_ROLES.join(', ')} ${
              AVAILABLE_ROADMAP_ROLES.length === 1 ? 'has' : 'have'
            } a roadmap so far — the others are still being written.`}
          />
        ) : (
          <RoadmapView roadmap={roadmap} />
        )}
      </div>
    </AppShell>
  );
}
