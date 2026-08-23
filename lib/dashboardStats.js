// Replaces the Step 15/16 mock data (MOCK_MARKET_SNAPSHOT,
// MOCK_TOP_COMPANIES) with real numbers computed from the same cache
// the existing StatCards already read. Kept as small pure functions,
// not inline in the page, so they're easy to unit test later if this
// logic grows.

// Same tier boundaries as lib/mockData.js's trustBadgeLabel/Color —
// intentionally duplicated rather than imported, since mockData.js is
// mock/reference data and importing "real" dashboard logic from a file
// literally named mockData would be a confusing dependency direction.
export function computeMarketSnapshot(jobs) {
  const snapshot = { trusted: 0, good: 0, review: 0, suspicious: 0 };
  for (const job of jobs) {
    const score = job.trust_score ?? 0;
    if (score >= 80) snapshot.trusted += 1;
    else if (score >= 60) snapshot.good += 1;
    else if (score >= 40) snapshot.review += 1;
    else snapshot.suspicious += 1;
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
