import Topbar from './Topbar';
import Footer from './Footer';

// Update 67 — loading states between pages. Sidebar and MobileNav
// used to render fresh inside AppShell on every single page — meaning
// the sidebar itself would flicker/reset on every navigation once a
// loading.js skeleton was introduced (Next.js's loading.js suspends
// everything inside the page.js it's paired with, and AppShell used
// to be called FROM INSIDE page.js). They now live in the persistent
// app/(app)/layout.js instead, which Next.js keeps mounted across
// navigations within the group — so the sidebar stays visible and
// interactive while a page's content loads, instead of the whole
// screen flashing blank.
//
// AppShell is now just the per-page chrome that genuinely needs
// page-specific data (Topbar's title/subtitle/icon — several pages
// compute these from server-fetched data, like Dashboard's sync-time
// subtitle or an admin import's own title, so this couldn't just move
// to the layout and be driven by the URL alone) plus the content area
// and footer. No longer async — it doesn't fetch anything itself
// anymore; that's the layout's job now.
export default function AppShell({ title, subtitle, icon, children }) {
  return (
    <>
      <Topbar title={title} subtitle={subtitle} icon={icon} />
      <main className="flex-1 px-4 py-6 md:px-8">{children}</main>
      <Footer />
    </>
  );
}
