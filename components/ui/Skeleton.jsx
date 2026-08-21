export function SkeletonBlock({ className = '' }) {
  return (
    <div className={`animate-pulse rounded-md bg-ink/10 dark:bg-white/10 ${className}`} />
  );
}

export function JobCardSkeleton() {
  return (
    <div className="rounded-card border border-ink/10 bg-white p-4 shadow-card dark:border-white/10 dark:bg-slate-800">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <SkeletonBlock className="h-4 w-2/3" />
          <SkeletonBlock className="h-3 w-1/3" />
          <SkeletonBlock className="h-3 w-1/2" />
        </div>
        <SkeletonBlock className="h-14 w-14 rounded-full" />
      </div>
      <SkeletonBlock className="mt-4 h-3 w-full" />
      <SkeletonBlock className="mt-2 h-3 w-5/6" />
      <div className="mt-4 flex gap-2 border-t border-ink/5 pt-3 dark:border-white/5">
        <SkeletonBlock className="h-8 w-20" />
        <SkeletonBlock className="h-8 w-20" />
        <SkeletonBlock className="h-8 w-28" />
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-card border border-ink/10 bg-white p-4 shadow-card dark:border-white/10 dark:bg-slate-800">
      <SkeletonBlock className="h-3 w-20" />
      <SkeletonBlock className="mt-3 h-8 w-14" />
    </div>
  );
}
