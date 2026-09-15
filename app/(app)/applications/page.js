import { ClipboardList, ShieldCheck } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import EmptyState from '@/components/ui/EmptyState';
import ApplicationsPageClient from '@/components/applications/ApplicationsPageClient';
import { getViewer } from '@/lib/viewer';

export default async function ApplicationsPage() {
  const viewer = await getViewer();
  const isAdmin = viewer.kind === 'admin';

  return (
    <AppShell title="Applications" subtitle="Track every application from saved to offer" icon={ClipboardList}>
      {isAdmin ? (
        <EmptyState
          icon={ShieldCheck}
          title="Admin accounts don't track applications"
          description="This tracker is per-user, tied to a regular JobScout account. Log in as a regular user to use it — the Admin tab is where your account-management tools live instead."
        />
      ) : (
        <ApplicationsPageClient />
      )}
    </AppShell>
  );
}
