// Replaces the Step 15/16 mock data (MOCK_MARKET_SNAPSHOT,
// MOCK_TOP_COMPANIES) with real numbers computed from the same cache
// the existing StatCards already read. Kept as small pure functions,
// not inline in the page, so they're easy to unit test later if this
// logic grows.

// Step 35: 5-tier system now (was 3, from Step 18) — matching
// lib/mockData.js's trustBadgeLabel/Color exactly, just expressed as
// camelCase object keys here instead of the hyphenated CSS-token keys
// mockData.js uses, since this object is plain data, not a class name.
// Prefers each job's own trust_tier field (computed at scrape/insert
// time, with access to brand recognition + whether a real negative
// signal fired) over re-deriving a tier from trust_score alone — see
// scraper/trust_scoring.py's module docstring for why that distinction
// matters. Falls back to score-only thresholds for any job missing the
// field (e.g. cache data from before this migration).
function tierKeyFromScore(score) {
  if (score >= 85) return 'highlyTrusted';
  if (score >= 70) return 'trusted';
  if (score >= 50) return 'unverified';
  if (score >= 30) return 'redFlag';
  return 'suspicious';
}

const TIER_LABEL_TO_KEY = {
  'highly trusted': 'highlyTrusted',
  trusted: 'trusted',
  unverified: 'unverified',
  'red flag': 'redFlag',
  suspicious: 'suspicious',
};

function tierKeyForJob(job) {
  if (job.trust_tier) {
    return TIER_LABEL_TO_KEY[job.trust_tier.toLowerCase()] || 'unverified';
  }
  return tierKeyFromScore(job.trust_score ?? 0);
}

export function computeMarketSnapshot(jobs) {
  const snapshot = { highlyTrusted: 0, trusted: 0, unverified: 0, redFlag: 0, suspicious: 0 };
  for (const job of jobs) {
    const key = tierKeyForJob(job);
    if (snapshot[key] !== undefined) snapshot[key] += 1;
  }
  return snapshot;
}

export function computeTopCompanies(jobs, limit = 5) {
  const counts = new Map();
  for (const job of jobs) {
    const name = job.company?.trim();
    if (!name) continue;
    counts.set(name, (counts.get(name) || 0) + 1);
  }

  return [...counts.entries()]
    .map(([name, openRoles]) => ({ name, openRoles }))
    .sort((a, b) => b.openRoles - a.openRoles)
    .slice(0, limit);
}
