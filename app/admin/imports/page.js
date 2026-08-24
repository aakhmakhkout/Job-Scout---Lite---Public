import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';

// Must be dynamic — this reads live Supabase data via the service-role
// client, which (unlike lib/supabase/server.js) doesn't touch cookies(),
// so Next has no automatic signal to skip static generation here. Without
// this, the build tries to prerender the page once at build time and
// freeze whatever data existed then — exactly wrong for an admin screen
// that needs to show the current state on every visit.
export const dynamic = 'force-dynamic';

export default async function ImportsListPage() {
  const admin = createAdminClient();
  const { data: imports, error } = await admin
    .from('imports')
    .select('id, status, total_items, approved_count, rejected_count, uploaded_at, sources(name)')
    .order('uploaded_at', { ascending: false });

  return (
    <div className="min-h-screen bg-paper px-4 py-8 dark:bg-slate-900">
      <div className="mx-auto w-full max-w-3xl">
        <div className="flex items-center justify-between">
          <div>
            <Link href="/admin" className="text-sm text-brand hover:underline">
              ← Back to admin
            </Link>
            <h1 className="mt-3 text-lg font-semibold">Imports</h1>
          </div>
          <Link
            href="/admin/imports/new"
            className="rounded-md bg-brand px-3 py-2 text-sm font-medium text-white hover:bg-brand-dark"
          >
            New import
          </Link>
        </div>

        {error && (
          <p className="mt-6 rounded-md bg-suspicious/10 px-3 py-2 text-sm text-suspicious">
            Could not load imports.
          </p>
        )}

        {!error && (!imports || imports.length === 0) && (
          <p className="mt-6 text-sm text-ink-muted dark:text-slate-400">
            No imports yet — upload your first batch to get started.
          </p>
        )}

        <div className="mt-6 space-y-3">
          {imports?.map((imp) => {
            const pendingCount = imp.total_items - imp.approved_count - imp.rejected_count;
            return (
              <Link
                key={imp.id}
                href={`/admin/imports/${imp.id}`}
                className="block rounded-card border border-ink/10 bg-white p-4 shadow-card transition-colors hover:border-brand/40 dark:border-white/10 dark:bg-slate-800"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{imp.sources?.name || 'Unlabeled source'}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      imp.status === 'reviewed'
                        ? 'bg-trusted/10 text-trusted'
                        : 'bg-review/10 text-review'
                    }`}
                  >
                    {imp.status === 'reviewed' ? 'Reviewed' : 'Needs review'}
                  </span>
                </div>
                <p className="mt-1 text-xs text-ink-muted dark:text-slate-400">
                  {imp.total_items} items — {imp.approved_count} approved,{' '}
                  {imp.rejected_count} rejected
                  {pendingCount > 0 ? `, ${pendingCount} pending` : ''} ·{' '}
                  {new Date(imp.uploaded_at).toLocaleString()}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
