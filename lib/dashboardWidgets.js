// The fixed set of dashboard sections admin can manage — visibility
// for all of them, editable title/description only for the ones whose
// entire content IS copy (the resource boxes and the Interview-prep
// placeholder). A StatCard's "title" is really its data label (e.g.
// "New jobs today") tightly coupled to the number it's showing, so
// letting that drift from what it actually represents would be
// confusing rather than useful — those get a visibility toggle only.
//
// `key` here is the same string stored in `dashboard_widgets.key`.
// The two resource-box keys deliberately match
// `resource_${category.key}` from lib/resourceCategories.js, so a
// widget's override can be looked up directly from its category's own
// key with no separate mapping table to keep in sync.
export const WIDGET_DEFS = [
  { key: 'stat_new_jobs', label: 'New jobs today (stat)', editableCopy: false },
  { key: 'stat_trusted_jobs', label: 'Trusted jobs (stat)', editableCopy: false },
  { key: 'stat_applied', label: 'Applied (stat)', editableCopy: false },
  { key: 'stat_upcoming_interviews', label: 'Upcoming interviews (stat)', editableCopy: false },
  { key: 'market_snapshot', label: 'Market snapshot (chart)', editableCopy: false },
  { key: 'top_companies', label: 'Top companies (list)', editableCopy: false },
  {
    key: 'resource_resume-builders',
    label: 'Resume builders (resource box)',
    editableCopy: true,
    defaultTitle: 'Resume builders',
    defaultDescription: 'Genuinely free tools, not ads.',
  },
  {
    key: 'resource_free-tools',
    label: 'Free tools & sites (resource box)',
    editableCopy: true,
    defaultTitle: 'Free tools & sites',
    defaultDescription: 'No paywall, no catch — for job hunting and for building things.',
  },
  {
    key: 'interview_prep',
    label: 'Interview prep (coming soon box)',
    editableCopy: true,
    defaultTitle: 'Interview prep',
    defaultDescription:
      'Question banks, mock-interview tips, and company-specific prep — planned, not built yet.',
  },
];

const DEFS_BY_KEY = new Map(WIDGET_DEFS.map((def) => [def.key, def]));

// Merges any admin overrides on top of the hardcoded defaults above —
// a widget with no row in `dashboard_widgets` yet is simply "visible,
// default copy," not an error or an empty state. Takes whatever
// Supabase client the caller already has (the Dashboard's own
// cookie-aware `viewer.supabase` — works because of the public-read
// RLS policy — or the admin page's service-role client) rather than
// creating its own, so this stays usable from both a page a regular
// user loads and an admin-only settings page.
//
// Fails open on error, same judgment call as lib/jobsCache.js's hidden-
// listings check: if this query fails, the Dashboard should still
// render with sane defaults, not break entirely over a table this
// feature added.
export async function getWidgetSettings(supabaseClient) {
  const settings = {};
  for (const def of WIDGET_DEFS) {
    settings[def.key] = {
      visible: true,
      title: def.defaultTitle || null,
      description: def.defaultDescription || null,
    };
  }

  try {
    const { data, error } = await supabaseClient
      .from('dashboard_widgets')
      .select('key, visible, title, description');
    if (error) throw error;

    for (const row of data || []) {
      const def = DEFS_BY_KEY.get(row.key);
      if (!def) continue; // stale/unknown key — ignore rather than error
      settings[row.key] = {
        visible: row.visible,
        title: def.editableCopy ? row.title || def.defaultTitle || null : null,
        description: def.editableCopy ? row.description || def.defaultDescription || null : null,
      };
    }
  } catch (err) {
    console.error('getWidgetSettings: failed to load overrides, using defaults', err);
  }

  return settings;
}
