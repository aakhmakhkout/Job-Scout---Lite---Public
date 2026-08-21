// Stand-in data so the frontend can be designed and reviewed before the
// scraper, cache endpoint, and Supabase tables exist (later steps).
// Shape matches the real `jobs` table / cache/jobs.json exactly, so swapping
// this out for a real fetch('/api/jobs/cache') later is a one-line change.

export const mockJobs = [
  {
    id: 1,
    title: 'Senior Backend Engineer',
    company: 'Northwind Analytics',
    location: 'Remote (US)',
    source: 'Greenhouse',
    apply_url: 'https://example.com/jobs/northwind-backend-engineer',
    summary: 'Own the ingestion pipeline for a small data platform team. Python, Postgres, occasional Go.',
    posted_at: '2026-08-10T09:00:00Z',
    trust_score: 92,
    is_suspicious: 0,
  },
  {
    id: 2,
    title: 'Product Designer',
    company: 'Fernbank Studio',
    location: 'Remote (Worldwide)',
    source: 'Lever',
    apply_url: 'https://example.com/jobs/fernbank-product-designer',
    summary: 'Small design team shipping a B2B scheduling tool. Figma-first, close work with founders.',
    posted_at: '2026-08-09T14:20:00Z',
    trust_score: 78,
    is_suspicious: 0,
  },
  {
    id: 3,
    title: 'Customer Support Rep (Data Entry)',
    company: 'QuickCash Global',
    location: 'Remote',
    source: 'WeWorkRemotely',
    apply_url: 'https://example.com/jobs/quickcash-support-rep',
    summary: 'Earn money fast! Simple typing job, no experience needed. Registration fee required to start.',
    posted_at: '2026-08-10T02:00:00Z',
    trust_score: 12,
    is_suspicious: 1,
  },
  {
    id: 4,
    title: 'Frontend Engineer, React',
    company: 'Alder & Finch',
    location: 'Hybrid — Austin, TX',
    source: 'RemoteOK',
    apply_url: 'https://example.com/jobs/alder-finch-frontend',
    summary: 'Rebuilding a legacy dashboard in Next.js. Small team, direct access to the CTO.',
    posted_at: '2026-08-08T11:45:00Z',
    trust_score: 65,
    is_suspicious: 0,
  },
  {
    id: 5,
    title: 'Data Entry Associate — Work From Home',
    company: 'BrightPath Ventures LLC',
    location: 'Remote',
    source: 'WeWorkRemotely',
    apply_url: 'https://example.com/jobs/brightpath-data-entry',
    summary: 'Flexible hours, investment required for starter kit. Training fee refunded after 30 days.',
    posted_at: '2026-08-11T03:10:00Z',
    trust_score: 5,
    is_suspicious: 1,
  },
  {
    id: 6,
    title: 'DevOps Engineer',
    company: 'Coldwater Systems',
    location: 'Remote (EU)',
    source: 'Greenhouse',
    apply_url: 'https://example.com/jobs/coldwater-devops',
    summary: 'Manage CI/CD and a modest AWS footprint for a 12-person infra team. On-call is light.',
    posted_at: '2026-08-09T08:30:00Z',
    trust_score: 88,
    is_suspicious: 0,
  },
  {
    id: 7,
    title: 'Marketing Coordinator',
    company: 'Hollow Creek Goods',
    location: 'Remote (US/Canada)',
    source: 'Wellfound',
    apply_url: 'https://example.com/jobs/hollow-creek-marketing',
    summary: 'Run email campaigns and light content for a small DTC brand. Salary listed: $52k–62k.',
    posted_at: '2026-08-07T16:00:00Z',
    trust_score: 71,
    is_suspicious: 0,
  },
  {
    id: 8,
    title: 'Virtual Assistant',
    company: 'PrimeTask Recruiters',
    location: 'Remote',
    source: 'RemoteOK',
    apply_url: 'https://example.com/jobs/primetask-virtual-assistant',
    summary: 'Captcha job, no interview. Contact via personal Gmail. Security deposit for equipment.',
    posted_at: '2026-08-10T20:15:00Z',
    trust_score: 8,
    is_suspicious: 1,
  },
];

export const mockDashboardStats = {
  newJobsToday: 14,
  trustedJobsCount: 37,
  appliedJobsCount: 6,
  upcomingInterviewsCount: 2,
  lastSyncAt: '2026-08-11T06:00:00Z',
};

export function trustBadgeLabel(score) {
  if (score >= 80) return 'Trusted';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Review';
  return 'Suspicious';
}

export function trustBadgeColor(score) {
  if (score >= 80) return 'trusted';
  if (score >= 60) return 'good';
  if (score >= 40) return 'review';
  return 'suspicious';
}
