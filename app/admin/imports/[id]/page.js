import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import ImportReviewClient from '@/components/admin/ImportReviewClient';

// Same reasoning as app/admin/imports/page.js — force dynamic so this
// always reflects live review state, not a build-time snapshot.
export const dynamic = 'force-dynamic';

export default async function ImportReviewPage({ params }) {
  const admin = createAdminClient();

  const { data: importRow } = await admin
    .from('imports')
    .select('id, status, total_items, approved_count, rejected_count, uploaded_at, sources(name)')
    .eq('id', params.id)
    .maybeSingle();

  if (!importRow) notFound();

  const { data: items } = await admin
    .from('import_items')
    .select('id, raw_payload, status, duplicate_of, validation_errors, reviewer_notes, created_at')
    .eq('import_id', params.id)
    .order('created_at', { ascending: true });

  return (
    <div className="min-h-screen bg-paper px-4 py-8 dark:bg-slate-900">
      <div className="mx-auto w-full max-w-3xl">
        <Link href="/admin/imports" className="text-sm text-brand hover:underline">
          ← Back to imports
        </Link>
        <h1 className="mt-3 text-lg font-semibold">{importRow.sources?.name || 'Unlabeled source'}</h1>
        <p className="mt-1 text-sm text-ink-muted dark:text-slate-400">
          Uploaded {new Date(importRow.uploaded_at).toLocaleString()} ·{' '}
          {importRow.total_items} items
        </p>

        <ImportReviewClient importId={importRow.id} initialItems={items || []} />
      </div>
    </div>
  );
}
