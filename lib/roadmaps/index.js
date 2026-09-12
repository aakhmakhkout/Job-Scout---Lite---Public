// Update 57 — Career Roadmap, sub-step 2. The shared machinery every
// role's roadmap content plugs into — registry lookup and the
// learned-vs-not-learned annotation logic. Individual roles' content
// lives in sibling files (frontend.js for now; backend.js, etc. join
// this registry as their own sub-steps land — see the Career Roadmap
// checklist in updates.md).
import { FRONTEND_ROADMAP } from './frontend';

export const ROADMAPS = {
  Frontend: FRONTEND_ROADMAP,
};

export function getRoadmapForRole(role) {
  return ROADMAPS[role] || null;
}

export const AVAILABLE_ROADMAP_ROLES = Object.keys(ROADMAPS);

// Returns a deep copy of `roadmap` with each topic annotated as
// `learned: boolean` (true if any of its skillMatch names appear in
// `resumeSkills`) and each stage annotated with a `progress` summary
// — counts of learned/total topics, split out by tier, so a stage
// header can show something like "3 of 4 must-haves" without the UI
// needing to recompute it. Pure function, no AI: this is the same
// "does this skill name appear in that list" check used everywhere
// else in this feature.
export function annotateRoadmapWithProgress(roadmap, resumeSkills) {
  if (!roadmap) return null;
  const skillSet = new Set(resumeSkills || []);

  const stages = roadmap.stages.map((stage) => {
    const topics = stage.topics.map((topic) => ({
      ...topic,
      learned: (topic.skillMatch || []).some((skill) => skillSet.has(skill)),
    }));

    const progress = { must: { learned: 0, total: 0 }, important: { learned: 0, total: 0 }, optional: { learned: 0, total: 0 } };
    for (const topic of topics) {
      const bucket = progress[topic.tier] || progress.optional;
      bucket.total += 1;
      if (topic.learned) bucket.learned += 1;
    }

    return { ...stage, topics, progress };
  });

  return { ...roadmap, stages };
}
