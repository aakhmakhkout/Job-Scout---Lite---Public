import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/apiAuth';

export async function GET() {
  const { user, supabase, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const { data, error } = await supabase
    .from('saved_jobs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ saved_jobs: data });
}

export async function POST(request) {
  const { user, supabase, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const body = await request.json().catch(() => null);
  if (!body?.job_apply_url) {
    return NextResponse.json({ error: 'job_apply_url is required' }, { status: 400 });
  }

  // Upsert on the (user_id, job_apply_url) unique constraint — saving a job
  // that's already saved just updates it (e.g. new notes) instead of erroring.
  const { data, error } = await supabase
    .from('saved_jobs')
    .upsert(
      {
        user_id: user.id,
        job_apply_url: body.job_apply_url,
        job_title: body.job_title ?? null,
        job_company: body.job_company ?? null,
        job_location: body.job_location ?? null,
        notes: body.notes ?? null,
      },
      { onConflict: 'user_id,job_apply_url' }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ saved_job: data }, { status: 201 });
}
