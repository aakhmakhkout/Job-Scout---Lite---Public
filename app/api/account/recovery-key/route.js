import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/apiAuth';
import { generateRecoveryKey } from '@/lib/recoveryKey';

export async function GET() {
  const { user, supabase, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const { data: profile, error: fetchError } = await supabase
    .from('profiles')
    .select('recovery_key')
    .eq('id', user.id)
    .single();

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  // Lazy-generate: anyone who signed up before this feature existed
  // won't have a key yet. First time they load it, create and save one
  // rather than requiring them to do anything special.
  if (profile.recovery_key) {
    return NextResponse.json({ recovery_key: profile.recovery_key, is_new: false });
  }

  const newKey = generateRecoveryKey();
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ recovery_key: newKey })
    .eq('id', user.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ recovery_key: newKey, is_new: true });
}
