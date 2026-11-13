import { ok, fail, body, adminRoute } from '@/lib/http';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/admin';
import { MEMBER_COLUMNS, forgetMember } from '@/lib/auth';
import { EMAIL_RE, PIN_RE } from '@/lib/utils';
import type { TablesUpdate } from '@/lib/supabase/database.types';

type Params = { id: string };

export const PATCH = adminRoute<Params>(async (req, { params }) => {
  const id = Number((await params).id);
  const b = await body(req);
  const patch: TablesUpdate<'members'> = {};
  if (typeof b.name === 'string' && b.name.trim().length >= 2) patch.name = b.name.trim();
  if (typeof b.email === 'string') {
    if (b.email && !EMAIL_RE.test(b.email)) return fail('Please enter a valid email');
    patch.email = b.email.trim() || null;
  }
  if (typeof b.ward === 'string') patch.ward = b.ward;
  if (typeof b.pincode === 'string') {
    if (!PIN_RE.test(b.pincode)) return fail('Please enter a valid pincode');
    patch.pincode = b.pincode;
  }
  if (b.status === 'active' || b.status === 'suspended') patch.status = b.status;

  const supabase = await createClient();
  const { data, error } = await supabase.from('members').update(patch).eq('id', id).select(`${MEMBER_COLUMNS}, user_id`).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return fail('Not found', 404);

  // Suspended members cannot sign in.
  if (patch.status && data.user_id) {
    await createServiceClient().auth.admin.updateUserById(data.user_id, { ban_duration: patch.status === 'suspended' ? '876000h' : 'none' });
  }
  forgetMember(data.user_id);
  const { user_id: _omit, ...item } = data;
  return ok({ item });
});

export const DELETE = adminRoute<Params>(async (_req, { params }) => {
  const id = Number((await params).id);
  const supabase = await createClient();
  const { data, error } = await supabase.from('members').delete().eq('id', id).select('user_id').maybeSingle();
  if (error) throw new Error(error.message);
  forgetMember(data?.user_id);
  if (data?.user_id) await createServiceClient().auth.admin.deleteUser(data.user_id);
  return ok({ ok: true });
});
