import { getViewer } from '@/lib/viewer';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import MobileNav from './MobileNav';
import Footer from './Footer';

export default async function AppShell({ title, subtitle, icon, children }) {
  // Defense in depth: middleware already gates these pages behind
  // login (regular or admin, as of Step 23), but if this call hits a
  // transient issue, degrade to "no email shown in the sidebar" rather
  // than crashing the whole shell every logged-in page renders inside.
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
      <div className="flex min-w-0 flex-1 flex-col pb-16 md:pb-0">
        <Topbar title={title} subtitle={subtitle} icon={icon} />
        <main className="flex-1 px-4 py-6 md:px-8">{children}</main>
        <Footer />
      </div>
      <MobileNav isAdmin={isAdmin} />
    </div>
  );
}
