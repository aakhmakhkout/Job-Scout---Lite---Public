// The icon choices offered in the admin item form — kept here as the
// one shared reference so the admin UI and ResourceCategoryBox.jsx's
// ICONS map can't drift apart on what's actually valid.
//
// Update 46: the set of valid category *keys* used to be hardcoded
// right here too (RESOURCE_ITEM_CATEGORY_KEYS), but categories are now
// admin-managed (see lib/resourceCategories.js) — so which keys are
// valid is whatever getResourceCategories() currently returns, fetched
// fresh by each caller rather than a static list that could go stale
// the moment an admin adds or removes a category.
export const RESOURCE_ITEM_ICONS = [
  'FileEdit',
  'FileText',
  'FileStack',
  'Wrench',
  'Lightbulb',
  'PenTool',
  'Image',
];

// Returns { [category_key]: [items...] }, ordered oldest-first (the
// order items were added, no manual reordering built this step — see
// PROGRESS.md's Step 27 scoping note). A category with zero rows comes
// back as an empty array, not a missing key — deliberate, since
// ResourceCategoryBox.jsx already treats an empty items array as "show
// Coming soon" rather than an error state, so the caller doesn't need
// to special-case it.
//
// `categoryKeys` is the live list of valid keys (from
// getResourceCategories()) — the caller fetches categories first and
// passes their keys in here, rather than this function reaching for
// the categories table itself, so a page that already has the
// categories in hand isn't made to fetch them twice.
//
// Fails open on error, same judgment call as every other admin-managed
// Dashboard data source (lib/jobsCache.js, lib/dashboardWidgets.js):
// if this query fails, every category degrades to Coming-soon rather
// than breaking the whole Dashboard.
export async function getResourceItemsByCategory(supabaseClient, categoryKeys) {
  const byCategory = Object.fromEntries((categoryKeys || []).map((key) => [key, []]));

  try {
    const { data, error } = await supabaseClient
      .from('resource_items')
      .select('id, category_key, name, description, url, icon')
      .order('created_at', { ascending: true });
    if (error) throw error;

    for (const item of data || []) {
      if (!byCategory[item.category_key]) byCategory[item.category_key] = [];
      byCategory[item.category_key].push(item);
    }
  } catch (err) {
    console.error('getResourceItemsByCategory: failed to load items, categories will show empty', err);
  }

  return byCategory;
}
