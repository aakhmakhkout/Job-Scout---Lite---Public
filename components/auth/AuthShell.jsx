import Image from 'next/image';
import Footer from '@/components/layout/Footer';

export default function AuthShell({ title, subtitle, children }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-4 dark:bg-slate-900">
      <div className="w-full max-w-sm">
        {/* Fixed dark chip (see Sidebar.jsx) — the wordmark image has
            no theme-aware text, so it needs a constant dark backdrop
            rather than this page's own light/dark background. */}
        <div className="mb-6 flex justify-center">
          <span className="inline-flex items-center rounded-md bg-slate-950 px-3 py-2">
            <Image src="/logo.png" alt="JobScout Lite" width={160} height={113} className="h-9 w-auto" priority />
          </span>
        </div>

        <div className="rounded-card border border-ink/10 bg-white p-6 shadow-card dark:border-white/10 dark:bg-slate-800">
          <h1 className="text-lg font-semibold">{title}</h1>
          {subtitle && (
            <p className="mt-1 text-sm text-ink-muted dark:text-slate-400">{subtitle}</p>
          )}
          <div className="mt-5">{children}</div>
        </div>
      </div>

      <div className="mt-8 w-full max-w-sm">
        <Footer align="center" />
      </div>
    </div>
  );
}
