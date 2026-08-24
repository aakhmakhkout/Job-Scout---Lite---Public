import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/apiAuth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function DELETE() {
  const { user, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  try {
    const admin = createAdminClient();
    // Deletes the auth.users row. Every other table (profiles,
    // applications, saved_jobs, blocked_companies) references auth.users
    // with "on delete cascade", so this one call cleans up everything —
    // no manual per-table deletion needed.
    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || 'Failed to delete account' },
      { status: 500 }
    );
  }
}
