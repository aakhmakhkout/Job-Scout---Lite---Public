import { GraduationCap } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import JobsPageClient from '@/components/jobs/JobsPageClient';

export default function InternshipsPage() {
  return (
    <AppShell
      title="Internships"
      subtitle="Listings from the last 4 days, refreshed every 6 hours"
      icon={GraduationCap}
    >
      <JobsPageClient jobType="Internship" />
    </AppShell>
  );
}
