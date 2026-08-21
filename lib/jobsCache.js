import { readFile } from 'fs/promises';
import path from 'path';

const CACHE_PATH = path.join(process.cwd(), 'cache', 'jobs.json');

// Both /api/jobs/cache (for the client-side Jobs page) and the Dashboard
// Server Component need this same data. Reading the file directly here —
// rather than the Dashboard fetching its own API route — avoids the
// awkwardness of a Server Component calling its own app's API over HTTP.
export async function getJobsCache() {
  try {
    const raw = await readFile(CACHE_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    return { generated_at: null, count: 0, jobs: [] };
  }
}
