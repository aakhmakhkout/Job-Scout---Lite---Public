import PageSkeleton from '@/components/ui/PageSkeleton';

// Update 67 — shown automatically by Next.js while this route's
// page.js (a Server Component doing real data fetching) is loading —
// no manual wiring needed beyond this file existing. The persistent
// app/(app)/layout.js keeps the sidebar mounted throughout, so only
// this content area swaps to the skeleton.
export default function Loading() {
  return <PageSkeleton variant="stats" />;
}
