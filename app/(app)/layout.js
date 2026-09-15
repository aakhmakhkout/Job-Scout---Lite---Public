import { getViewer } from '@/lib/viewer';
import Sidebar from '@/components/layout/Sidebar';
import MobileNav from '@/components/layout/MobileNav';

// Update 67 — the persistent chrome every page under app/(app)/ shares
// (Dashboard, Jobs, Internships, Applications, Interviews, Profile,
// Roadmap, and every /admin page). This is what makes loading states
// actually feel like an app instead of a website: Next.js keeps a
// layout.js mounted across client-side navigations between routes
// that share it, so the sidebar here stays visible and interactive
// while each page's own loading.js skeleton shows in the content area
// — no more full-screen flash on every click.
//
// getViewer() is called here now instead of inside AppShell (where it
// used to live, duplicating a call every single page.js ALSO already
// makes for its own content logic) — one fewer redundant fetch per
// page load, not just a reorganization.
//
// A route group folder — the parentheses in "(app)" — organizes files
// without adding a URL segment: app/(app)/dashboard/page.js still
// serves at /dashboard, exactly as before this refactor. Auth pages
// (login, signup, reset-password, the admin login, the privacy
// policy) intentionally live outside this group — they don't get a
// sidebar at all.
export default async function AppLayout({ children }) {
  // Defense in depth: middleware already gates these pages behind
  // login (regular or admin), but if this call hits a transient
  // issue, degrade to "no email shown in the sidebar" rather than
  // crashing the whole shell every logged-in page renders inside.
  let userEmail;
  let isAdmin = false;
  try {
    const viewer = await getViewer();
    isAdmin = viewer.kind === 'admin';
    userEmail = viewer.kind === 'user' ? viewer.user.email : viewer.kind === 'admin' ? viewer.admin.email : undefined;
  } catch (err) {
    userEmail = undefined;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar userEmail={userEmail} isAdmin={isAdmin} />
      <div className="flex min-w-0 flex-1 flex-col pb-16 md:pb-0">{children}</div>
      <MobileNav isAdmin={isAdmin} />
    </div>
  );
}
