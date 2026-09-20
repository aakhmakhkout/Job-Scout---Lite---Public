import { GraduationCap } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import JobsPageClient from '@/components/jobs/JobsPageClient';
import { getViewer } from '@/lib/viewer';

export default async function InternshipsPage() {
  const viewer = await getViewer();
  const isAdmin = viewer.kind === 'admin';
  // Update 77 — Internships is now reachable without an account too,
  // via the same shared JobsPageClient as /jobs.
  const isGuest = viewer.kind === null;

  return (
    <AppShell
      title="Internships"
      subtitle="Listings from the last 4 days, refreshed every 6 hours"
      icon={GraduationCap}
    >
      <JobsPageClient jobType="Internship" isAdmin={isAdmin} isGuest={isGuest} />
    </AppShell>
  );
}
