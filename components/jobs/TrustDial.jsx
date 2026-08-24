import { trustBadgeLabel, trustBadgeColor } from '@/lib/mockData';

const COLOR_MAP = {
  trusted: { ring: '#2E8B57', text: 'text-trusted' },
  unverified: { ring: '#C79A2B', text: 'text-unverified' },
  suspicious: { ring: '#C7362B', text: 'text-suspicious' },
};

// A small radial gauge — the needle/fill reads at a glance like an
// inspection-stamp dial, standing in for a flat "80%" badge. This is the
// one recurring signature element across the whole app.
//
// Accepts the whole `job` (not just a raw score) as of Step 18, so it
// can read job.trust_tier when present — see lib/mockData.js for why
// that's preferred over re-deriving a tier from score alone.
export default function TrustDial({ job, size = 56 }) {
  const score = job?.trust_score ?? 0;
  const clamped = Math.max(0, Math.min(100, score));
  const label = trustBadgeLabel(job);
  const colorKey = trustBadgeColor(job);
  const { ring, text } = COLOR_MAP[colorKey];

  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / 100);
  const center = size / 2;

  return (
    <div
      className="flex flex-col items-center gap-1"
      role="img"
      aria-label={`Trust score ${clamped} out of 100 — ${label}`}
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            strokeWidth="4"
            className="stroke-ink/10 dark:stroke-white/10"
          />
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            strokeWidth="4"
            strokeLinecap="round"
            stroke={ring}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 700ms ease-out' }}
          />
        </svg>
        <span className="ledger-num absolute inset-0 flex items-center justify-center text-xs font-semibold">
          {clamped}
        </span>
      </div>
      <span className={`text-[11px] font-medium uppercase tracking-wide ${text}`}>{label}</span>
    </div>
  );
}
