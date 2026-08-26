import Footer from '@/components/layout/Footer';

export default function AuthShell({ title, subtitle, children }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-4 dark:bg-slate-900">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-brand text-sm font-bold text-white">
            J
          </span>
          <span className="font-display text-lg font-semibold">JobScout Lite</span>
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
