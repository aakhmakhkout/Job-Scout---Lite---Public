// Step 44 — a small, deliberately unobtrusive version tag, blended
// into the Dashboard's existing "Last scraper sync" subtitle line
// rather than added as a new, separate UI element.
//
// Reads directly from package.json's own "version" field — bumped by
// hand each step (see PROGRESS.md's step history for what each bump
// corresponds to) — so there's exactly one source of truth for the
// number, not a second counter that could quietly drift out of sync
// with the real one.
//
// The actual point of this feature, stated plainly: most of this
// project's real work happens in files the public showcase repo
// deliberately excludes (scraper/, lib/adminAuth/, etc. — see
// .gitignore's PUBLIC-REPO-ONLY EXCLUSIONS block). Without something
// that changes in a *tracked* file every step, the public repo's
// commit history would look mostly frozen even during an actively-
// developed stretch. Bumping this one line each step gives every step
// a real, visible, committable change in the public repo too.
import packageJson from '../package.json';

export function getAppVersion() {
  const [major, , patch] = packageJson.version.split('.');
  return `V${major}.${(patch || '0').padStart(3, '0')}`;
}
