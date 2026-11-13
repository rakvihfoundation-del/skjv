import { ok, fail, body, adminRoute } from '@/lib/http';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/admin';
import { BUCKETS } from '@/lib/supabase/env';
import { VOLUNTEER_COLUMNS, forgetVolunteer } from '@/lib/auth';
import type { TablesUpdate } from '@/lib/supabase/database.types';

type Params = { id: string };

// Verify / un-verify, suspend / re-activate a volunteer.
export const PATCH = adminRoute<Params>(async (req, { params }) => {
  const id = Number((await params).id);
  const b = await body(req);
  const patch: TablesUpdate<'volunteers'> = {};
  if (typeof b.verified === 'boolean') patch.verified = b.verified;
  if (b.status === 'active' || b.status === 'suspended') patch.status = b.status;
  if (!Object.keys(patch).length) return fail('Nothing to change');

  const supabase = await createClient();
  const { data, error } = await supabase.from('volunteers').update(patch).eq('id', id).select(`${VOLUNTEER_COLUMNS}, user_id`).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return fail('Not found', 404);

  // Suspended volunteers cannot sign in.
  if (patch.status && data.user_id) {
    await createServiceClient().auth.admin.updateUserById(data.user_id, { ban_duration: patch.status === 'suspended' ? '876000h' : 'none' });
  }
  forgetVolunteer(data.user_id);
  const { user_id: _omit, ...item } = data;
  return ok({ item });
});

// Delete a volunteer: their record, login, event registrations and ID proof file.
export const DELETE = adminRoute<Params>(async (_req, { params }) => {
  const id = Number((await params).id);
  const supabase = await createClient();
  const { data, error } = await supabase.from('volunteers').delete().eq('id', id).select('user_id, proof_path').maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return fail('Not found', 404);
  forgetVolunteer(data.user_id);
  const svc = createServiceClient();
  if (data.proof_path) await svc.storage.from(BUCKETS.proofs).remove([data.proof_path]);
  if (data.user_id) await svc.auth.admin.deleteUser(data.user_id);
  return ok({ ok: true });
});
