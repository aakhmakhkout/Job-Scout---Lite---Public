import { redirect } from 'next/navigation';

// Update 77 — this used to send anyone without a Supabase session
// straight to /login, independent of (and running before) middleware
// ever gets a say — exactly the "login screen pops up on first visit"
// problem being fixed. Dashboard is genuinely public now (see
// middleware.js), so root just always sends everyone there, logged in
// or not; the page itself branches on the real, live identity via
// getViewer() rather than this route trying to duplicate that check.
export default function RootPage() {
  redirect('/dashboard');
}
