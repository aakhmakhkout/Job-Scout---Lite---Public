import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/apiAuth';

const VALID_STATUSES = ['Saved', 'Applied', 'Interview', 'Offer', 'Rejected'];

export async function GET() {
  const { user, supabase, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ applications: data });
}

export async function POST(request) {
  const { user, supabase, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const body = await request.json().catch(() => null);
  if (!body?.job_title || !body?.company) {
    return NextResponse.json(
      { error: 'job_title and company are required' },
      { status: 400 }
    );
  }

  const status = VALID_STATUSES.includes(body.status) ? body.status : 'Saved';

  const { data, error } = await supabase
    .from('applications')
    .insert({
      user_id: user.id,
      job_title: body.job_title,
      company: body.company,
      apply_url: body.apply_url ?? null,
      applied_date: body.applied_date ?? null,
      status,
      notes: body.notes ?? null,
      interview_date: body.interview_date ?? null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ application: data }, { status: 201 });
}
