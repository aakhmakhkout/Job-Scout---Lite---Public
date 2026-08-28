import { TriangleAlert } from 'lucide-react';

export default function SuspiciousBanner() {
  return (
    <div className="flex items-center gap-2 rounded-md border border-suspicious/30 bg-suspicious/10 px-3 py-1.5 text-xs font-medium text-suspicious dark:border-suspicious/40 dark:bg-suspicious/15">
      <TriangleAlert className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
      Flagged: matches known scam-listing language. Verify before applying.
    </div>
  );
}
