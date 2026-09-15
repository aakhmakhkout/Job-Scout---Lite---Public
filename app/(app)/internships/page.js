import { GraduationCap } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import JobsPageClient from '@/components/jobs/JobsPageClient';
import { getViewer } from '@/lib/viewer';

export default async function InternshipsPage() {
  const viewer = await getViewer();
  const isAdmin = viewer.kind === 'admin';

  return (
    <AppShell
      title="Internships"
      subtitle="Listings from the last 4 days, refreshed every 6 hours"
      icon={GraduationCap}
    >
      <JobsPageClient jobType="Internship" isAdmin={isAdmin} />
    </AppShell>
  );
}
