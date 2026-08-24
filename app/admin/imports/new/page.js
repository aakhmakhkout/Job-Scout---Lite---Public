import Link from 'next/link';
import ImportUploadForm from '@/components/admin/ImportUploadForm';

export default function NewImportPage() {
  return (
    <div className="min-h-screen bg-paper px-4 py-8 dark:bg-slate-900">
      <div className="mx-auto w-full max-w-2xl">
        <Link href="/admin" className="text-sm text-brand hover:underline">
          ← Back to admin
        </Link>
        <h1 className="mt-3 text-lg font-semibold">New import</h1>
        <p className="mt-1 text-sm text-ink-muted dark:text-slate-400">
          Upload a JSON export from your WhatsApp/Telegram collector. Every item
          gets checked against your existing jobs for duplicates before you
          review anything.
        </p>

        <div className="mt-6 rounded-card border border-ink/10 bg-white p-6 shadow-card dark:border-white/10 dark:bg-slate-800">
          <ImportUploadForm />
        </div>
      </div>
    </div>
  );
}
