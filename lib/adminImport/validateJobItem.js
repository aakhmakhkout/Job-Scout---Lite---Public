// Validates one raw item from an uploaded JSON import against the
// schema your WhatsApp/Telegram collectors need to produce. Kept
// intentionally simple (required-field + type checks, no external
// libraries) — good enough for a personal-scale admin tool, not meant
// to be a general-purpose schema validator.
//
// Expected shape (see also the help text on /admin/imports/new):
// {
//   "title": "Senior Backend Engineer",       // required
//   "company": "Acme Corp",                    // required
//   "apply_url": "https://acme.com/jobs/123",   // required, must be unique
//   "location": "Remote",                       // optional
//   "description": "...",                       // optional
//   "job_type": "Job" | "Internship",            // optional, default "Job"
//   "posted_at": "2026-08-20T00:00:00Z"          // optional, default now
// }

export function validateJobItem(raw) {
  const errors = [];

  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    return { valid: false, errors: ['Item is not a JSON object'], normalized: null };
  }

  const title = typeof raw.title === 'string' ? raw.title.trim() : '';
  if (!title) errors.push('Missing or empty "title"');

  const company = typeof raw.company === 'string' ? raw.company.trim() : '';
  if (!company) errors.push('Missing or empty "company"');

  const applyUrl = typeof raw.apply_url === 'string' ? raw.apply_url.trim() : '';
  if (!applyUrl) {
    errors.push('Missing or empty "apply_url"');
  } else {
    try {
      // eslint-disable-next-line no-new
      new URL(applyUrl);
    } catch {
      errors.push('"apply_url" is not a valid URL');
    }
  }

  let jobType = 'Job';
  if (raw.job_type !== undefined) {
    if (raw.job_type === 'Job' || raw.job_type === 'Internship') {
      jobType = raw.job_type;
    } else {
      errors.push('"job_type" must be "Job" or "Internship" if provided');
    }
  }

  let postedAt = new Date().toISOString();
  if (raw.posted_at !== undefined) {
    const parsed = new Date(raw.posted_at);
    if (Number.isNaN(parsed.getTime())) {
      errors.push('"posted_at" is not a valid date if provided');
    } else {
      postedAt = parsed.toISOString();
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors, normalized: null };
  }

  return {
    valid: true,
    errors: [],
    normalized: {
      title,
      company,
      apply_url: applyUrl,
      location: typeof raw.location === 'string' && raw.location.trim() ? raw.location.trim() : 'Remote',
      description: typeof raw.description === 'string' ? raw.description.trim() : null,
      job_type: jobType,
      posted_at: postedAt,
    },
  };
}
