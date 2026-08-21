import AppShell from '@/components/layout/AppShell';
import EmptyState from '@/components/ui/EmptyState';
import InterviewCard from '@/components/applications/InterviewCard';
import { createClient } from '@/lib/supabase/server';

// Server Component — reads straight from Supabase since this page is
// read-only (no client interactivity needed), which keeps the client JS
// bundle smaller than routing it through a fetch('/api/...') round trip.
export default async function InterviewsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let interviews = [];
  let loadError = false;
  try {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'Interview')
      .not('interview_date', 'is', null)
      .order('interview_date', { ascending: true });
    if (error) throw error;
    interviews = data || [];
  } catch (err) {
    loadError = true;
  }

  return (
    <AppShell title="Interviews" subtitle="Upcoming interviews, soonest first">
      {loadError ? (
        <EmptyState
          title="Couldn't load interviews"
          description="There was a problem reaching the database. Try refreshing the page."
        />
      ) : interviews.length === 0 ? (
        <EmptyState
          title="No interviews scheduled yet"
          description="Mark an application as 'Interview' with a date in the tracker and it will show up here."
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {interviews.map((app) => (
            <InterviewCard key={app.id} application={app} />
          ))}
        </div>
      )}
    </AppShell>
  );
}
