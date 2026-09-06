// Shared between the admin user-list route and the purge route so the
// two can never quietly disagree on what "inactive" means — the list
// shows you who's over the line using this exact function, and the
// purge route re-runs this exact function server-side before deleting
// anyone, rather than trusting whatever the client had on screen.

export const INACTIVE_WINDOW_DAYS = 30;

// last_seen_at only exists since Step 23 — an account created before
// that step (or one that simply hasn't loaded a shared page since)
// can have last_seen_at: null even though it's a perfectly normal,
// possibly-recently-created account. Falling back to created_at for
// those means "days since the last signal we have of this account
// doing anything," not "always treat unknown as ancient" — a null
// last_seen_at doesn't automatically mean 30+ days inactive if the
// account was created yesterday.
export function daysSinceActive(profile) {
  const reference = profile.last_seen_at || profile.created_at;
  if (!reference) return null;
  const ms = Date.now() - new Date(reference).getTime();
  return Math.floor(ms / 86_400_000);
}

export function isInactive(profile) {
  const days = daysSinceActive(profile);
  return days !== null && days >= INACTIVE_WINDOW_DAYS;
}
