import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/apiAuth';

export async function PATCH(request, { params }) {
  const { user, supabase, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const body = await request.json().catch(() => null);
  if (!body || typeof body.notes !== 'string') {
    return NextResponse.json({ error: 'notes (string) is required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('saved_jobs')
    .update({ notes: body.notes })
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

  return NextResponse.json({ saved_job: data });
}

export async function DELETE(_request, { params }) {
  const { user, supabase, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const { error } = await supabase
    .from('saved_jobs')
    .delete()
    .eq('id', params.id)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
