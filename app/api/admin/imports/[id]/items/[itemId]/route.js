import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/adminAuth/serverSession';
import { validateJobItem } from '@/lib/adminImport/validateJobItem';

// PATCH — approve or reject one item within an import.
// Body: { action: 'approve' | 'reject', notes?: string }
//
// Honest Phase 2 scope limits, by design, not oversight:
// - No in-app editing of a bad item's fields — if validation_errors is
//   non-empty, the only allowed action is reject. Fixing bad data means
//   fixing it at the source (the collector) and re-uploading.
// - Duplicate-flagged items can also only be rejected here, never
//   approved — resolving "is this actually an update to an existing
//   listing" is a real judgment call this phase doesn't attempt to
//   automate. Worth a future step if it comes up often in practice.
export async function PATCH(request, { params }) {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { action, notes } = body || {};
  if (action !== 'approve' && action !== 'reject') {
    return NextResponse.json({ error: 'action must be "approve" or "reject"' }, { status: 400 });
  }

  const admin = createAdminClient();
  const { id: importId, itemId } = params;

  const { data: item, error: itemError } = await admin
    .from('import_items')
    .select('*')
    .eq('id', itemId)
    .eq('import_id', importId)
    .maybeSingle();

  if (itemError || !item) {
    return NextResponse.json({ error: 'Import item not found' }, { status: 404 });
  }

  if (item.status === 'approved' || item.status === 'rejected') {
    return NextResponse.json({ error: 'This item has already been reviewed' }, { status: 400 });
  }

  if (action === 'reject') {
    const { error: updateError } = await admin
      .from('import_items')
      .update({ status: 'rejected', reviewer_notes: notes || null })
      .eq('id', itemId);

    if (updateError) {
      return NextResponse.json({ error: 'Could not reject item' }, { status: 500 });
    }

    await bumpImportCounts(admin, importId, { rejected: 1 });
    return NextResponse.json({ ok: true, status: 'rejected' });
  }

  // action === 'approve'
  if (item.validation_errors && item.validation_errors.length > 0) {
    return NextResponse.json(
      { error: 'Cannot approve an item with validation errors — reject it and ask for a corrected re-upload' },
      { status: 400 }
    );
  }
  if (item.status === 'duplicate') {
    return NextResponse.json(
      { error: 'Cannot approve a duplicate-flagged item — reject it, or handle the existing listing directly' },
      { status: 400 }
    );
  }

  const { valid, normalized } = validateJobItem(item.raw_payload);
  if (!valid) {
    // Shouldn't happen (validated at upload time), but don't trust it blindly.
    return NextResponse.json({ error: 'Item failed re-validation, cannot approve' }, { status: 400 });
  }

  const { error: insertError } = await admin.from('jobs').insert({
    ...normalized,
    trust_score: 50,
    trust_tier: 'Unverified', // manually reviewed, not algorithmically scored — see trust_score/trust_reasons below
    trust_reasons: ['Manually reviewed and approved by an admin — not scored by the automated trust algorithm'],
    import_item_id: item.id,
  });

  if (insertError) {
    // Most likely cause: apply_url collided with something inserted
    // after the upload's dedupe check ran (a real, if rare, race).
    if (insertError.code === '23505') {
      await admin.from('import_items').update({ status: 'duplicate' }).eq('id', itemId);
      return NextResponse.json(
        { error: 'A job with this apply_url was added since upload — marked as duplicate instead' },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: 'Could not create job from this item' }, { status: 500 });
  }

  const { error: updateError } = await admin
    .from('import_items')
    .update({ status: 'approved', reviewer_notes: notes || null })
    .eq('id', itemId);

  if (updateError) {
    return NextResponse.json({ error: 'Job created, but updating item status failed' }, { status: 500 });
  }

  await bumpImportCounts(admin, importId, { approved: 1 });
  return NextResponse.json({ ok: true, status: 'approved' });
}

// Re-reads current counts rather than trusting a client-supplied delta,
// and flips the parent import to 'reviewed' once nothing pending or
// duplicate-unresolved remains — small enough to not need a DB function.
async function bumpImportCounts(admin, importId, { approved = 0, rejected = 0 }) {
  const { data: importRow } = await admin
    .from('imports')
    .select('approved_count, rejected_count, total_items')
    .eq('id', importId)
    .maybeSingle();
  if (!importRow) return;

  const newApproved = importRow.approved_count + approved;
  const newRejected = importRow.rejected_count + rejected;

  const { count: remaining } = await admin
    .from('import_items')
    .select('id', { count: 'exact', head: true })
    .eq('import_id', importId)
    .in('status', ['pending', 'duplicate']);

  await admin
    .from('imports')
    .update({
      approved_count: newApproved,
      rejected_count: newRejected,
      status: remaining === 0 ? 'reviewed' : 'pending',
    })
    .eq('id', importId);
}
