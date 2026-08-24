import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/apiAuth';

export async function DELETE(_request, { params }) {
  const { user, supabase, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const { error } = await supabase
    .from('blocked_companies')
    .delete()
    .eq('id', params.id)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
