import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/apiAuth';
import { generateRecoveryKey } from '@/lib/recoveryKey';

export async function POST() {
  const { user, supabase, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const newKey = generateRecoveryKey();
  const { error } = await supabase
    .from('profiles')
    .update({ recovery_key: newKey })
    .eq('id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ recovery_key: newKey });
}
