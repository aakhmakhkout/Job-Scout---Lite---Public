// The set of valid category keys admin can add items to, and the icon
// choices offered in the admin form — kept here as the one shared
// reference so the admin UI and this fetch helper can't drift apart on
// what's actually valid. Matches lib/resourceCategories.js's category
// keys and ResourceCategoryBox.jsx's ICONS map exactly.
export const RESOURCE_ITEM_CATEGORY_KEYS = ['resume-builders', 'free-tools'];

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
// Fails open on error, same judgment call as every other admin-managed
// Dashboard data source (lib/jobsCache.js, lib/dashboardWidgets.js):
// if this query fails, every category degrades to Coming-soon rather
// than breaking the whole Dashboard.
export async function getResourceItemsByCategory(supabaseClient) {
  const byCategory = Object.fromEntries(RESOURCE_ITEM_CATEGORY_KEYS.map((key) => [key, []]));

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
