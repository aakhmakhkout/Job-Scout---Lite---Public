// Update 67 — loading states between pages. One shared skeleton
// component with a few variants, used by every route's loading.js
// under app/(app)/, rather than 13 bespoke pixel-matched designs.
// Good-enough and honest about being a loading placeholder (pulsing
// gray blocks, not a fake preview of real content) beats a slower-to-
// ship, harder-to-maintain full redesign per page — this mirrors the
// Topbar skeleton exactly (so there's no visible seam between it and
// the real Topbar that replaces it) and then fills the content area
// with a shape that roughly matches what that page actually shows.
function Bar({ className = '' }) {
  return <div className={`animate-pulse rounded-md bg-ink/10 dark:bg-white/10 ${className}`} />;
}

function TopbarSkeleton() {
  return (
    <header className="flex items-center justify-between border-b border-ink/10 bg-paper/80 px-4 py-4 backdrop-blur dark:border-white/10 dark:bg-slate-900/80 md:px-8">
      <div className="flex items-center gap-3">
        <Bar className="hidden h-9 w-9 shrink-0 sm:block" />
        <div>
          <Bar className="h-5 w-36" />
          <Bar className="mt-2 h-3.5 w-56" />
        </div>
      </div>
      <Bar className="h-8 w-8 rounded-full" />
    </header>
  );
}

function StatsVariant() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Bar key={i} className="h-24 rounded-card" />
        ))}
      </div>
      <Bar className="h-48 rounded-card" />
    </div>
  );
}

function CardsVariant() {
  return (
    <div className="space-y-4">
      <Bar className="h-4 w-40" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Bar key={i} className="h-32 rounded-card" />
        ))}
      </div>
    </div>
  );
}

function ListVariant() {
  return (
    <div className="space-y-3">
      <Bar className="h-4 w-32" />
      {[0, 1, 2, 3, 4].map((i) => (
        <Bar key={i} className="h-16 rounded-card" />
      ))}
    </div>
  );
}

function FormVariant() {
  return (
    <div className="space-y-4">
      {[0, 1, 2].map((i) => (
        <Bar key={i} className="h-28 rounded-card" />
      ))}
    </div>
  );
}

const VARIANTS = {
  stats: StatsVariant,
  cards: CardsVariant,
  list: ListVariant,
  form: FormVariant,
};

export default function PageSkeleton({ variant = 'form' }) {
  const Content = VARIANTS[variant] || FormVariant;
  return (
    <>
      <TopbarSkeleton />
      <main className="flex-1 px-4 py-6 md:px-8">
        <Content />
      </main>
    </>
  );
}
