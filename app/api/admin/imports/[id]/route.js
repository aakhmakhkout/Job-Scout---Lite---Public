import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/adminAuth/serverSession';

export async function GET(request, { params }) {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  const admin = createAdminClient();

  const { data: importRow, error: importError } = await admin
    .from('imports')
    .select('id, status, total_items, approved_count, rejected_count, uploaded_at, sources(name)')
    .eq('id', params.id)
    .maybeSingle();

  if (importError || !importRow) {
    return NextResponse.json({ error: 'Import not found' }, { status: 404 });
  }

  const { data: items, error: itemsError } = await admin
    .from('import_items')
    .select('id, raw_payload, status, duplicate_of, validation_errors, reviewer_notes, created_at')
    .eq('import_id', params.id)
    .order('created_at', { ascending: true });

  if (itemsError) {
    return NextResponse.json({ error: 'Could not load import items' }, { status: 500 });
  }

  return NextResponse.json({ import: importRow, items });
}
