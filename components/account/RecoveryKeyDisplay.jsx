'use client';

import { useState } from 'react';

export default function RecoveryKeyDisplay({ recoveryKey }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(recoveryKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      // Clipboard API can fail in some contexts (e.g. non-HTTPS) — the
      // key is still selectable/visible as plain text, so this isn't
      // fatal, just less convenient.
    }
  }

  return (
    <div className="rounded-md border border-brand/30 bg-brand/5 p-3 dark:bg-brand/10">
      <div className="flex items-center justify-between gap-3">
        <code className="ledger-num select-all break-all text-sm font-medium text-brand dark:text-brand-light">
          {recoveryKey}
        </code>
        <button
          type="button"
          onClick={handleCopy}
          className="shrink-0 rounded-md border border-brand/40 px-2.5 py-1 text-xs font-medium text-brand hover:bg-brand/10 dark:text-brand-light"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
    </div>
  );
}
