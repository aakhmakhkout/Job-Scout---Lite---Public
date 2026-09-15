import { redirect } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import ProfilePageClient from '@/components/account/ProfilePageClient';
import { getViewer } from '@/lib/viewer';
import { daysSinceActive } from '@/lib/adminUsers';

export default async function ProfilePage() {
  const viewer = await getViewer();

  // Same behavior as before Step 30's refactor: an admin session isn't
  // a real Supabase Auth user, so it doesn't pass this check either —
  // /profile is a regular-user-account concept (recovery key, delete
  // account, inactivity policy), not something admin sessions have.
  if (viewer.kind !== 'user') redirect('/login');

  // daysSinceActive() is the exact same function the admin purge route
  // (Step 24) uses to decide real eligibility — using it here too means
  // this notice can never show a countdown that disagrees with what
  // will actually happen. Fed the *pre-this-visit* last_seen_at
  // (see lib/viewer.js) so it reflects genuine prior inactivity, not
  // the fresh "now" timestamp this very page load just wrote.
  const daysInactive = daysSinceActive({
    last_seen_at: viewer.previousLastSeenAt,
    created_at: viewer.createdAt,
  });

  return (
    <AppShell title="Profile" subtitle="Your account and recovery settings">
      <ProfilePageClient userEmail={viewer.user.email} daysInactive={daysInactive} />
    </AppShell>
  );
}
