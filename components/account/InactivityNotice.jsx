import { Clock } from 'lucide-react';

// Step 25 scope, deliberately: the notice exists, with the right copy
// and visual treatment, and nothing more. It always shows the same
// standing-policy message below, regardless of the account's real
// last_seen_at — NOT wired to lib/adminUsers.js's real
// daysSinceActive()/isInactive() yet. That's intentional, per what was
// asked: structure and copy now, real logic and the day-25 escalation
// as a later follow-up. The privacy-policy page (Step 29,
// /privacy-policy#inactivity-and-account-removal) now documents this
// same policy for anyone who wants the full picture — linked right
// below this component on the Profile page.
//
// The eventual behavior, kept here as a spec for that follow-up rather
// than left undocumented:
//   - Day 0-24 inactive: the standing message below.
//   - Day 25-29 inactive: escalates to "Your account will be
//     terminated in {30 - daysInactive} days. Log in for 2 consecutive
//     days to reset the timer and keep your account active."
//   - Any 2 consecutive days of activity within that window resets the
//     inactivity clock back to 0, same as a fresh day-0 account.
//   - Day 30+: handled by Admin's existing bulk-purge action
//     (Step 24), not by anything client-facing — by then the notice
//     itself is moot.
export default function InactivityNotice() {
  return (
    <div className="rounded-card border border-review/30 bg-review/5 p-4 dark:border-review/30 dark:bg-review/10">
      <div className="flex gap-2.5">
        <Clock className="mt-0.5 h-4 w-4 shrink-0 text-review" strokeWidth={2.25} />
        <p className="text-xs leading-relaxed text-ink-soft dark:text-slate-300">
          <span className="font-medium text-review">Inactive-account policy: </span>
          To keep JobScout Lite free to run, accounts that stay inactive for more than 30 days
          may be automatically removed. Log in at least once a month to keep yours active.
        </p>
      </div>
    </div>
  );
}
