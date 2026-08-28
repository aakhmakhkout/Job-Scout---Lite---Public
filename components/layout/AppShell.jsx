import { createClient } from '@/lib/supabase/server';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import MobileNav from './MobileNav';
import Footer from './Footer';

export default async function AppShell({ title, subtitle, icon, children }) {
  const supabase = createClient();
  // Defense in depth: middleware already gates these pages behind login,
  // but if this specific call hits a transient network blip, degrade to
  // "no email shown in the sidebar" rather than crashing the whole shell
  // every logged-in page renders inside.
  let userEmail;
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userEmail = user?.email;
  } catch (err) {
    userEmail = undefined;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar userEmail={userEmail} />
      <div className="flex min-w-0 flex-1 flex-col pb-16 md:pb-0">
        <Topbar title={title} subtitle={subtitle} icon={icon} />
        <main className="flex-1 px-4 py-6 md:px-8">{children}</main>
        <Footer />
      </div>
      <MobileNav />
    </div>
  );
}
