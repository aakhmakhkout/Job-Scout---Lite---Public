import { Briefcase } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import JobsPageClient from '@/components/jobs/JobsPageClient';
import { getViewer } from '@/lib/viewer';

export default async function JobsPage() {
  // cache()-wrapped, so this doesn't cost a second identity lookup —
  // AppShell calls the same function within this same request. Needed
  // here specifically so JobCard can show admin's "Remove" action, and
  // so this page can skip the saved-jobs/applications/blocklist
  // fetches for admin the same way Dashboard/Applications/Interviews
  // already do (Step 23) — those were never going to succeed for an
  // admin session, since it isn't a Supabase Auth user with rows in
  // those tables.
  const viewer = await getViewer();
  const isAdmin = viewer.kind === 'admin';
  // Update 77 — Jobs is now reachable without an account. See
  // middleware.js and JobsPageClient.jsx for the guest-browsing story.
  const isGuest = viewer.kind === null;

  return (
    <AppShell title="Jobs" subtitle="Listings from the last 4 days, refreshed every 6 hours" icon={Briefcase}>
      <JobsPageClient jobType="Job" isAdmin={isAdmin} isGuest={isGuest} />
    </AppShell>
  );
}
