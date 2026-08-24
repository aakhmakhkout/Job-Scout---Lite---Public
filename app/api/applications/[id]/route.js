import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/apiAuth';

const VALID_STATUSES = ['Saved', 'Applied', 'Interview', 'Offer', 'Rejected'];
const EDITABLE_FIELDS = [
  'job_title',
  'company',
  'apply_url',
  'applied_date',
  'status',
  'notes',
  'interview_date',
];

export async function PATCH(request, { params }) {
  const { user, supabase, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (body.status && !VALID_STATUSES.includes(body.status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const updates = {};
  for (const field of EDITABLE_FIELDS) {
    if (field in body) updates[field] = body[field];
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No editable fields provided' }, { status: 400 });
  }

  // .eq('user_id', ...) here is belt-and-suspenders on top of RLS — RLS
  // alone already prevents cross-user writes, this just makes intent explicit.
  const { data, error } = await supabase
    .from('applications')
    .update(updates)
    .eq('id', params.id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ application: data });
}

export async function DELETE(_request, { params }) {
  const { user, supabase, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const { error } = await supabase
    .from('applications')
    .delete()
    .eq('id', params.id)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
