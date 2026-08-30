import { Clock, AlertTriangle } from 'lucide-react';
import { INACTIVE_WINDOW_DAYS } from '@/lib/adminUsers';

// Step 30 — now wired to a real days-since-active number (see
// app/profile/page.js), computed with the exact same daysSinceActive()
// the admin purge route (Step 24) uses. That was a deliberate scoping
// choice, not the original Step 25 mock spec verbatim: the original
// comment here called for a stricter "2 consecutive days of activity"
// reset condition, tracked with its own separate streak state. Built
// that way, this notice's countdown could disagree with reality — e.g.
// showing "terminated in 2 days" the same visit that a single login
// already made the account safe under the real last_seen_at-based
// purge check. Simplified deliberately: this notice uses the identical
// clock that governs actual removal, so it can never show a number
// that's scarier (or safer) than what will actually happen. The
// privacy policy's inactivity section (Step 29) describes this same
// simplified behavior, not the original 2-day-streak draft.
//
// Three states, based on daysInactive:
//   - null or < 25: the standing low-key policy reminder (unchanged
//     copy/visual treatment from Step 25).
//   - 25-29: escalates to a specific countdown, stronger visual weight.
//   - 30+: eligible-for-removal wording — phrased as "may be removed"
//     rather than "will be removed on [date]", since the actual removal
//     is a periodic admin-initiated batch (Step 24), not an instant or
//     scheduled automatic action; by this point it could happen at any
//     time the admin next runs it, or not for a while if they haven't.
export default function InactivityNotice({ daysInactive }) {
  const isEscalated = daysInactive !== null && daysInactive >= 25 && daysInactive < INACTIVE_WINDOW_DAYS;
  const isEligible = daysInactive !== null && daysInactive >= INACTIVE_WINDOW_DAYS;
  const daysRemaining = isEscalated ? INACTIVE_WINDOW_DAYS - daysInactive : null;

  if (isEligible) {
    return (
      <div className="rounded-card border border-suspicious/40 bg-suspicious/5 p-4 dark:border-suspicious/40 dark:bg-suspicious/10">
        <div className="flex gap-2.5">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-suspicious" strokeWidth={2.25} />
          <p className="text-xs leading-relaxed text-ink-soft dark:text-slate-300">
            <span className="font-medium text-suspicious">Account inactive: </span>
            You haven&apos;t logged in for {daysInactive} days — your account is now eligible for
            removal to keep JobScout Lite free to run. It hasn&apos;t been deleted yet, but it may
            be at any time. Just being here now helps — log in regularly to stay active.
          </p>
        </div>
      </div>
    );
  }

  if (isEscalated) {
    return (
      <div className="rounded-card border border-suspicious/30 bg-suspicious/5 p-4 dark:border-suspicious/30 dark:bg-suspicious/10">
        <div className="flex gap-2.5">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-suspicious" strokeWidth={2.25} />
          <p className="text-xs leading-relaxed text-ink-soft dark:text-slate-300">
            <span className="font-medium text-suspicious">Inactive-account policy: </span>
            You&apos;ve been inactive for {daysInactive} days. Your account will become eligible
            for removal in {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} if you don&apos;t
            log in again — visiting any page (like this one) keeps it active.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-card border border-review/30 bg-review/5 p-4 dark:border-review/30 dark:bg-review/10">
      <div className="flex gap-2.5">
        <Clock className="mt-0.5 h-4 w-4 shrink-0 text-review" strokeWidth={2.25} />
        <p className="text-xs leading-relaxed text-ink-soft dark:text-slate-300">
          <span className="font-medium text-review">Inactive-account policy: </span>
          To keep JobScout Lite free to run, accounts that stay inactive for more than{' '}
          {INACTIVE_WINDOW_DAYS} days may be removed. Log in at least once a month to keep yours
          active.
        </p>
      </div>
    </div>
  );
}
