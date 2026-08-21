export default function SuspiciousBanner() {
  return (
    <div className="flex items-center gap-2 rounded-md border border-suspicious/30 bg-suspicious/10 px-3 py-1.5 text-xs font-medium text-suspicious dark:border-suspicious/40 dark:bg-suspicious/15">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0">
        <path
          d="M12 3 1.5 21h21L12 3Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path d="M12 9.5v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="12" cy="17" r="1" fill="currentColor" />
      </svg>
      Flagged: matches known scam-listing language. Verify before applying.
    </div>
  );
}
