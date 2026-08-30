// As of Step 27, this file only lists which resource-box categories
// exist — their actual items live in the `resource_items` Supabase
// table (see lib/resourceItems.js), fully admin-managed via
// /admin/resources. Before Step 27, this file also held each
// category's hardcoded `items` array; that's gone now, replaced by a
// one-time seed seeding the exact same items into `resource_items`
// (see supabase/schema.sql section 9) so upgrading didn't change what
// anyone sees.
//
// title/description here are effectively unused in practice — Step
// 26's dashboard_widgets already carries its own default title/
// description per category (lib/dashboardWidgets.js's WIDGET_DEFS),
// which is what actually renders. Kept here anyway as the category's
// canonical reference copy, since a key existing in exactly one place
// (the Supabase table) with no readable record of what it originally
// meant would be a worse trade than this small bit of redundancy.
export const RESOURCE_CATEGORIES = [
  {
    key: 'resume-builders',
    title: 'Resume builders',
    description: 'Genuinely free tools, not ads.',
  },
  {
    key: 'free-tools',
    title: 'Free tools & sites',
    description: 'No paywall, no catch — for job hunting and for building things.',
  },
];
