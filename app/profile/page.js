import { redirect } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import ProfilePageClient from '@/components/account/ProfilePageClient';
import { createClient } from '@/lib/supabase/server';

export default async function ProfilePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  return (
    <AppShell title="Profile" subtitle="Your account and recovery settings">
      <ProfilePageClient userEmail={user.email} />
    </AppShell>
  );
}
