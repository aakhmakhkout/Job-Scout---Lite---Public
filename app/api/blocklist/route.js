import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/apiAuth';

export async function GET() {
  const { user, supabase, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const { data, error } = await supabase
    .from('blocked_companies')
    .select('*')
    .eq('user_id', user.id)
    .order('company_name', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ blocked_companies: data });
}

export async function POST(request) {
  const { user, supabase, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const body = await request.json().catch(() => null);
  const companyName = body?.company_name?.trim();
  if (!companyName) {
    return NextResponse.json({ error: 'company_name is required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('blocked_companies')
    .upsert(
      { user_id: user.id, company_name: companyName },
      { onConflict: 'user_id,company_name', ignoreDuplicates: true }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ blocked_company: data }, { status: 201 });
}
