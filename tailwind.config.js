/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        // "Verification desk" palette — deep teal (trust) + rust (warning).
        paper: {
          DEFAULT: '#F7F8F6',
          dim: '#EEF1EE',
        },
        ink: {
          DEFAULT: '#14201E',
          soft: '#3E4C48',
          muted: '#8A9A94',
        },
        slate: {
          950: '#0C1214',
          900: '#10161A',
          800: '#161F23',
          700: '#1E2A2E',
          600: '#2A3A3E',
        },
        brand: {
          DEFAULT: '#1F6F5C',
          light: '#2E8B6F',
          dark: '#154A3D',
        },
        rust: {
          DEFAULT: '#C7562B',
          light: '#E07A4B',
          dark: '#8F3D1D',
        },
        trusted: '#2E8B57',
        good: '#4C8B2E',
        review: '#C79A2B',
        suspicious: '#C7362B',
        // Added for the 3-tier trust system (Step 18) — same amber as
        // "review" deliberately (same "needs a closer look, not
        // confirmed either way" visual meaning), but a distinct token
        // so trust-tier components aren't coupled to "review", which
        // still means something unrelated elsewhere (admin import
        // status, application status badges, etc.) and must not change.
        //
        // Step 37 — recolored per direct request. Changed from amber
        // to a neutral gray: "unverified" means "nothing confirmed
        // either way," which a gray/neutral tone reads as more
        // accurately than amber (amber implies an active caution,
        // which isn't what this tier is).
        unverified: '#6B7280',
        // Step 35 — the 3-tier system became 5 tiers (a new top
        // "Highly Trusted" band for recognized brands, and the old
        // catch-all under-50 bucket split into "Red Flag"/"Suspicious").
        //
        // Step 37 — recolored per direct request:
        //   Highly Trusted -> deep green (was purple)
        //   Red Flag       -> red (was burnt orange)
        // "highly-trusted" and "red-flag" are dedicated trust-tier-only
        // tokens (see the grep-confirmed usage note below), safe to
        // recolor in place with no risk of an unrelated part of the
        // app changing color alongside them.
        'highly-trusted': '#14532D',
        'red-flag': '#DC2626',
        // Step 37 — "trusted" (green) and "suspicious" (red) were the
        // two tiers whose requested colors could NOT just reuse the
        // app-wide `trusted`/`suspicious` tokens above: both of those
        // are heavily reused elsewhere for unrelated meanings — e app-
        // wide `trusted` also colors "approved" import status, "Offer"
        // application status, active-user badges, and every StatCard
        // accent; `suspicious` is this app's de-facto error/destructive
        // red, used on every auth form's error message, "Delete
        // account," "Reject," and more. Recoloring the shared tokens
        // to match this request would have silently recolored all of
        // that too. Two new tier-only tokens instead, decoupled from
        // both:
        'tier-trusted': '#2E8B57', // green — same value as the shared "trusted" token today, but on its own token so a future restyle of "approved/active" elsewhere in the app can't silently drag the trust-tier badge along with it
        'tier-suspicious': '#D97706', // orange/yellow, per request — deliberately NOT the same red as the shared "suspicious" token, which stays the app's error/destructive color everywhere else
      },
      fontFamily: {
        display: ['var(--font-display)', 'ui-sans-serif', 'system-ui'],
        body: ['var(--font-body)', 'ui-sans-serif', 'system-ui'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular'],
      },
      borderRadius: {
        card: '10px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(12, 18, 20, 0.06), 0 1px 1px rgba(12, 18, 20, 0.04)',
        'card-hover': '0 6px 16px rgba(12, 18, 20, 0.10), 0 2px 6px rgba(12, 18, 20, 0.06)',
      },
    },
  },
  plugins: [],
};
