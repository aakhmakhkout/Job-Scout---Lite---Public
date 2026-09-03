import { trustBadgeLabel, trustBadgeColor } from '@/lib/mockData';

// Step 35 — two new entries for the 5-tier system (highly-trusted /
// red-flag).
// Step 37 — recolored per direct request: deep green for Highly
// Trusted, green for Trusted, gray for Unverified, orange/yellow for
// Suspicious, red for Red Flag. "trusted" and "suspicious" use the new
// tier-only tokens (tier-trusted/tier-suspicious) rather than the
// shared app-wide "trusted"/"suspicious" tokens — see
// tailwind.config.js for why those two specifically needed dedicated
// tokens instead of just being recolored in place.
// Step 38 — swapped per direct request: Highly Trusted is now the
// (lighter) green, Trusted is now the deep green; Unverified's gray
// lightened one step toward white.
const COLOR_MAP = {
  'highly-trusted': { ring: '#2E8B57', text: 'text-highly-trusted' },
  trusted: { ring: '#14532D', text: 'text-tier-trusted' },
  unverified: { ring: '#9CA3AF', text: 'text-unverified' },
  'red-flag': { ring: '#DC2626', text: 'text-red-flag' },
  suspicious: { ring: '#D97706', text: 'text-tier-suspicious' },
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
