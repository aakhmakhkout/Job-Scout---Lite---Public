import { ClipboardList } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import ApplicationsPageClient from '@/components/applications/ApplicationsPageClient';

export default function ApplicationsPage() {
  return (
    <AppShell title="Applications" subtitle="Track every application from saved to offer" icon={ClipboardList}>
      <ApplicationsPageClient />
    </AppShell>
  );
}
