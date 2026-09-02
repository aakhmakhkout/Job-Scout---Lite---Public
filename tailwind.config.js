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
        unverified: '#C79A2B',
        // Step 35 — the 3-tier system became 5 tiers (a new top
        // "Highly Trusted" band for recognized brands, and the old
        // catch-all under-50 bucket split into "Red Flag"/"Suspicious").
        // Two new distinct tokens, not reused from the existing
        // green/amber/red spectrum, so all 5 tiers stay visually
        // distinguishable from each other at a glance.
        'highly-trusted': '#5B3FA0', // deep purple — deliberately outside the trust/red spectrum, reads as "premium/verified," not just "more green than trusted"
        'red-flag': '#D2691E', // burnt orange — sits visually between unverified-amber and suspicious-red, matching its position between those two tiers
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
