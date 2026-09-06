// Step 44 introduced this file with a first-pass version tag, blended
// into the Dashboard's existing "Last scraper sync" subtitle line
// rather than added as a new, separate UI element — that placement is
// unchanged and stays exactly as it was.
//
// Update 45 corrects the *numbering scheme itself* to match what you
// actually asked for: every 10 updates make up one "version," and the
// second number is just this update's position inside that block of
// 10 (01 through 10) — not a semver-style minor/patch bump. So:
//   Updates 1-10   -> V1.01 ... V1.10
//   Updates 11-20  -> V2.01 ... V2.10
//   Updates 21-30  -> V3.01 ... V3.10
//   ...and so on, forever.
// (Step 44 shipped "V2.001" -- just a patch number bumped by hand each
// step, with no real relationship to a fixed 10-per-version scheme.
// This replaces that.)
//
// package.json's "version" field stores this as
// "<versionNumber>.<positionInVersion>.<absoluteUpdateNumber>" -- e.g.
// "5.5.45" for Update 45 (version 5, 5th update inside that version,
// 45th update overall). That third number is kept purely as an audit
// trail: if the scheme's ever in question, "this was update #45
// overall" is recoverable straight from package.json, without cross-
// referencing PROGRESS.md.
//
// Reads directly from package.json's own "version" field -- bumped by
// hand each update (see PROGRESS.md's update history for what each
// bump corresponds to) -- so there's exactly one source of truth for
// the number, not a second counter that could quietly drift out of
// sync with the real one.
//
// The actual point of this feature, stated plainly: most of this
// project's real work happens in files the public showcase repo
// deliberately excludes (scraper/, lib/adminAuth/, etc. -- see
// .gitignore's PUBLIC-REPO-ONLY EXCLUSIONS block). Without something
// that changes in a *tracked* file every update, the public repo's
// commit history would look mostly frozen even during an actively-
// developed stretch. Bumping this one line each update gives every
// update a real, visible, committable change in the public repo too.
import packageJson from '../package.json';

export function getAppVersion() {
  const [versionNumber, positionInVersion] = packageJson.version.split('.');
  return `V${versionNumber}.${(positionInVersion || '0').padStart(2, '0')}`;
}
