// Fingerprint-based duplicate detection: matches on jobs.apply_url,
// exactly like the scraper's own dedup logic (Step 5) — same principle
// as "verified in the plan doc: URL -> fingerprint, not starting with
// embeddings." One batched query for the whole import, not one query
// per item, so uploading 100 jobs doesn't mean 100 round trips.

export async function findDuplicateApplyUrls(adminClient, applyUrls) {
  const uniqueUrls = [...new Set(applyUrls.filter(Boolean))];
  if (uniqueUrls.length === 0) return new Map();

  const { data, error } = await adminClient
    .from('jobs')
    .select('id, apply_url')
    .in('apply_url', uniqueUrls);

  if (error || !data) return new Map();

  const map = new Map();
  for (const job of data) {
    map.set(job.apply_url, job.id);
  }
  return map;
}
