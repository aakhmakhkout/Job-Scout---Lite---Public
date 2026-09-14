// Update 65 — a small circular progress ring for showing the resume
// score more graphically in the Dashboard's compact box (see
// components/dashboard/ResumeSummaryBox.jsx). Plain SVG, no charting
// library needed for one ring — a stroke-dasharray trick on a
// <circle> is the standard, dependency-free way to draw this.
export default function ScoreRing({ score, size = 64, strokeWidth = 6 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const colorClass =
    score >= 90
      ? 'text-emerald-500'
      : score >= 75
        ? 'text-brand'
        : score >= 60
          ? 'text-amber-500'
          : 'text-suspicious';

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className="fill-none stroke-ink/10 dark:stroke-white/10"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={`fill-none ${colorClass} stroke-current transition-all duration-500`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-lg font-bold ${colorClass}`}>{score}</span>
      </div>
    </div>
  );
}
