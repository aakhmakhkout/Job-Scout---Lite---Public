import ThemeToggle from './ThemeToggle';

export default function Topbar({ title, subtitle, icon: Icon }) {
  return (
    <header className="flex items-center justify-between border-b border-ink/10 bg-paper/80 px-4 py-4 backdrop-blur dark:border-white/10 dark:bg-slate-900/80 md:px-8">
      <div className="flex items-center gap-3">
        {Icon && (
          <span className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-md bg-brand/10 text-brand sm:flex">
            <Icon className="h-5 w-5" strokeWidth={2} />
          </span>
        )}
        <div>
          <h1 className="text-xl font-semibold">{title}</h1>
          {subtitle && (
            <p className="mt-0.5 text-sm text-ink-muted dark:text-slate-400">{subtitle}</p>
          )}
        </div>
      </div>
      <ThemeToggle />
    </header>
  );
}
