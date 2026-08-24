import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/adminAuth/serverSession';
import { validateJobItem } from '@/lib/adminImport/validateJobItem';
import { findDuplicateApplyUrls } from '@/lib/adminImport/dedupe';

// GET — list imports (newest first), with source name + counts, for
// the /admin/imports history page.
export async function GET() {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('imports')
    .select('id, status, total_items, approved_count, rejected_count, uploaded_at, sources(name)')
    .order('uploaded_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Could not load imports' }, { status: 500 });
  }

  return NextResponse.json({ imports: data });
}

// POST — create a new import batch from an uploaded JSON array.
// Body: { sourceName: string, items: object[] }
export async function POST(request) {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const sourceName = typeof body?.sourceName === 'string' ? body.sourceName.trim() : '';
  const items = Array.isArray(body?.items) ? body.items : null;

  if (!sourceName) {
    return NextResponse.json({ error: 'sourceName is required' }, { status: 400 });
  }
  if (!items || items.length === 0) {
    return NextResponse.json({ error: 'items must be a non-empty array' }, { status: 400 });
  }

  const admin = createAdminClient();

  // Find-or-create the source by name (case-insensitive match), so
  // re-uploading from the same collector groups under one source
  // instead of creating a near-duplicate every time.
  let sourceId;
  const { data: existingSource } = await admin
    .from('sources')
    .select('id')
    .ilike('name', sourceName)
    .maybeSingle();

  if (existingSource) {
    sourceId = existingSource.id;
  } else {
    const { data: newSource, error: sourceError } = await admin
      .from('sources')
      .insert({ name: sourceName })
      .select('id')
      .single();
    if (sourceError || !newSource) {
      return NextResponse.json({ error: 'Could not create source' }, { status: 500 });
    }
    sourceId = newSource.id;
  }

  // Validate every item up front, and check all apply_urls against
  // existing jobs in a single batched query rather than one query per
  // item (see lib/adminImport/dedupe.js).
  const validations = items.map((raw) => validateJobItem(raw));
  const candidateUrls = validations
    .map((v) => v.normalized?.apply_url)
    .filter(Boolean);
  const duplicateMap = await findDuplicateApplyUrls(admin, candidateUrls);

  const { data: importRow, error: importError } = await admin
    .from('imports')
    .insert({ source_id: sourceId, status: 'pending', total_items: items.length })
    .select('id')
    .single();

  if (importError || !importRow) {
    return NextResponse.json({ error: 'Could not create import' }, { status: 500 });
  }

  const rowsToInsert = items.map((raw, i) => {
    const { valid, errors, normalized } = validations[i];
    const isDuplicate = valid && duplicateMap.has(normalized.apply_url);

    return {
      import_id: importRow.id,
      raw_payload: raw,
      status: isDuplicate ? 'duplicate' : 'pending',
      duplicate_of: isDuplicate ? duplicateMap.get(normalized.apply_url) : null,
      validation_errors: errors,
    };
  });

  const { error: itemsError } = await admin.from('import_items').insert(rowsToInsert);
  if (itemsError) {
    return NextResponse.json({ error: 'Import created, but saving items failed' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, importId: importRow.id });
}
