// Step 27 made each category's *items* admin-managed via the
// `resource_items` table (see lib/resourceItems.js), but which
// categories exist at all — their keys, titles, descriptions, and
// display order — stayed hardcoded right here. Update 46 finishes
// that: `resource_categories` (see supabase/schema.sql section 10) is
// now the sole source of truth for that, fully admin-managed from
// /admin/resources (add, rename, delete, reorder) — this file no
// longer needs a hand-edit to add a third resource box.
//
// Same public-read RLS policy and "fails open to something sane"
// judgment call as every other admin-managed Dashboard data source in
// this project (lib/jobsCache.js, lib/dashboardWidgets.js,
// lib/resourceItems.js): if this query fails, the Dashboard falls
// back to the original two categories rather than showing zero
// resource boxes at all.
const FALLBACK_CATEGORIES = [
  {
    key: 'resume-builders',
    title: 'Resume builders',
    description: 'Genuinely free tools, not ads.',
    sort_order: 0,
  },
  {
    key: 'free-tools',
    title: 'Free tools & sites',
    description: 'No paywall, no catch — for job hunting and for building things.',
    sort_order: 1,
  },
];

export async function getResourceCategories(supabaseClient) {
  try {
    const { data, error } = await supabaseClient
      .from('resource_categories')
      .select('key, title, description, sort_order')
      .order('sort_order', { ascending: true });
    if (error) throw error;
    if (!data || data.length === 0) return FALLBACK_CATEGORIES;
    return data;
  } catch (err) {
    console.error('getResourceCategories: failed to load categories, using fallback', err);
    return FALLBACK_CATEGORIES;
  }
}

// Generates a URL/key-safe slug from an admin-provided title — used
// only at category-creation time (see app/api/admin/resource-
// categories/route.js, which appends -2, -3, etc. on a collision).
// Deliberately NOT used for renaming an existing category: once a key
// exists, `resource_items.category_key` and `dashboard_widgets`'
// `resource_${key}` override rows both reference it directly, so
// changing it after the fact would silently orphan both. "Rename" in
// the admin UI only ever touches title/description, never the key.
export function slugifyCategoryTitle(title) {
  const slug = (title || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-+|-+$)/g, '');
  return slug || 'category';
}
