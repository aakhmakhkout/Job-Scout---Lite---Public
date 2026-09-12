import Link from 'next/link';
import { ArrowLeft, Map } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import EmptyState from '@/components/ui/EmptyState';
import RoadmapView from '@/components/roadmap/RoadmapView';
import { getViewer } from '@/lib/viewer';
import { inferRoles } from '@/lib/roleInference';
import { getRoadmapForRole, annotateRoadmapWithProgress, AVAILABLE_ROADMAP_ROLES } from '@/lib/roadmaps';

export const dynamic = 'force-dynamic';

// Update 58 — Career Roadmap, sub-step 3. This page can render any
// role's roadmap given a `?role=` query param, and defaults to the
// current user's own inferred primary role when none is given — but
// it does NOT yet do the "smart" part described in the original ask
// (auto-redirect for a single-role resume, a picker for a multi-role
// one). That routing logic is sub-step 4's job, along with the actual
// entry point from the Resume review card. For now, this page mainly
// exists so the component from this update has somewhere real to
// render and be tested against.
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
  const role = roleFromQuery || inferred.primaryRole;

  const rawRoadmap = role ? getRoadmapForRole(role) : null;
  const roadmap = rawRoadmap ? annotateRoadmapWithProgress(rawRoadmap, resumeSkills) : null;

  return (
    <AppShell title="Career roadmap" subtitle="A learning path matched to your resume" icon={Map}>
      <Link href="/profile" className="inline-flex items-center gap-1.5 text-sm text-brand hover:underline">
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2.25} />
        Back to Profile
      </Link>

      <div className="mt-4">
        {!role ? (
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
