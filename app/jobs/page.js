import { Briefcase } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import JobsPageClient from '@/components/jobs/JobsPageClient';

export default function JobsPage() {
  return (
    <AppShell title="Jobs" subtitle="Listings from the last 4 days, refreshed every 6 hours" icon={Briefcase}>
      <JobsPageClient jobType="Job" />
    </AppShell>
  );
}
