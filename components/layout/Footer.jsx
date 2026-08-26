// Replaces the old centered "Copyright © 2026 Noumaan Nabi..." line.
// Kept in normal document flow (not position: fixed) deliberately —
// AppShell already has a fixed MobileNav pinned to the bottom on
// mobile, and a second fixed element in the same corner would risk
// overlapping it or a page's own action buttons. Right-aligning within
// the existing footer bar achieves the same "tucked in the corner"
// feel without that risk.
//
// align="center" is used on auth pages (login/signup/etc.), where the
// whole layout is a centered column and a right-aligned badge would
// look oddly detached from the centered card above it.

function GithubIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...props}>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.333-1.754-1.333-1.754-1.089-.744.084-.729.084-.729 1.205.084 1.838 1.237 1.838 1.237 1.07 1.834 2.809 1.304 3.495.997.108-.775.418-1.305.762-1.604-2.665-.305-5.466-1.334-5.466-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23a11.51 11.51 0 013.003-.404c1.018.005 2.045.138 3.003.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.91 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.014 2.898-.014 3.293 0 .322.216.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

function LinkedinIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...props}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.446-2.136 2.94v5.666H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

export default function Footer({ align = 'end' }) {
  return (
    <footer
      className={`border-t border-ink/10 px-4 py-3 dark:border-white/10 md:px-8 ${
        align === 'center' ? 'flex justify-center' : 'flex justify-end'
      }`}
    >
      <div className="flex items-center gap-3 text-xs text-ink-muted dark:text-slate-500">
        <span>Copyright © 2026 Noumaan Nabi</span>
        <a
          href="https://www.github.com/aakhmakhkout"
          target="_blank"
          rel="noreferrer"
          aria-label="GitHub"
          className="transition-colors hover:text-brand"
        >
          <GithubIcon />
        </a>
        <a
          href="https://www.linkedin.com/in/xymoexyom"
          target="_blank"
          rel="noreferrer"
          aria-label="LinkedIn"
          className="transition-colors hover:text-brand"
        >
          <LinkedinIcon />
        </a>
      </div>
    </footer>
  );
}
