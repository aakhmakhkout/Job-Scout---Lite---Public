'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const EXAMPLE = `[
  {
    "title": "Senior Backend Engineer",
    "company": "Acme Corp",
    "apply_url": "https://acme.com/jobs/123",
    "location": "Remote",
    "description": "Optional description text.",
    "job_type": "Job",
    "posted_at": "2026-08-20T00:00:00Z"
  }
]`;

export default function ImportUploadForm() {
  const router = useRouter();
  const [sourceName, setSourceName] = useState('');
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setJsonText(String(reader.result || ''));
    reader.readAsText(file);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    let items;
    try {
      const parsed = JSON.parse(jsonText);
      if (!Array.isArray(parsed)) throw new Error('not an array');
      items = parsed;
    } catch {
      setError('That doesn\'t look like valid JSON — needs to be an array of job objects, like the example below.');
      return;
    }

    if (!sourceName.trim()) {
      setError('Give this batch a source name (e.g. "WhatsApp — Bangalore Tech").');
      return;
    }

    setLoading(true);
    let res;
    try {
      res = await fetch('/api/admin/imports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceName: sourceName.trim(), items }),
      });
    } catch {
      setLoading(false);
      setError('Could not reach the server. Try again.');
      return;
    }

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'Upload failed');
      return;
    }

    const data = await res.json();
    router.push(`/admin/imports/${data.importId}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-ink-soft dark:text-slate-300">
          Source name
        </label>
        <input
          type="text"
          value={sourceName}
          onChange={(e) => setSourceName(e.target.value)}
          placeholder='e.g. "WhatsApp — Bangalore Tech"'
          className="w-full rounded-md border border-ink/15 bg-transparent px-3 py-2 text-sm placeholder:text-ink-muted/60 focus:border-brand dark:border-white/15 dark:placeholder:text-slate-500"
        />
        <p className="mt-1 text-xs text-ink-muted dark:text-slate-500">
          Re-uploading with the same source name groups this batch under it —
          no need to re-type it exactly, matching is case-insensitive.
        </p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-ink-soft dark:text-slate-300">
          Upload a .json file
        </label>
        <input
          type="file"
          accept="application/json,.json"
          onChange={handleFileChange}
          className="block w-full text-sm text-ink-muted file:mr-3 file:rounded-md file:border-0 file:bg-brand/10 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-brand hover:file:bg-brand/20 dark:text-slate-400"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-ink-soft dark:text-slate-300">
          ...or paste JSON directly
        </label>
        <textarea
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          rows={10}
          placeholder={EXAMPLE}
          className="w-full rounded-md border border-ink/15 bg-transparent px-3 py-2 font-mono text-xs placeholder:text-ink-muted/50 focus:border-brand dark:border-white/15 dark:placeholder:text-slate-600"
        />
      </div>

      <details className="rounded-md border border-ink/10 p-3 text-xs text-ink-muted dark:border-white/10 dark:text-slate-400">
        <summary className="cursor-pointer select-none font-medium text-ink-soft dark:text-slate-300">
          Expected JSON shape
        </summary>
        <pre className="mt-2 overflow-x-auto whitespace-pre-wrap font-mono">{EXAMPLE}</pre>
        <p className="mt-2">
          Only <code>title</code>, <code>company</code>, and <code>apply_url</code> are
          required. <code>apply_url</code> must be unique — that's how duplicates
          against existing jobs get detected.
        </p>
      </details>

      {error && (
        <p className="rounded-md bg-suspicious/10 px-3 py-2 text-sm text-suspicious">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-brand px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
      >
        {loading ? 'Uploading…' : 'Upload and review'}
      </button>
    </form>
  );
}
