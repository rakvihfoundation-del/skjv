import { ok, fail, body, str, publicRoute } from '@/lib/http';
import { createClient } from '@/lib/supabase/server';
import { findMemberLogin, MEMBER_COLUMNS } from '@/lib/auth';

const WRONG = 'Incorrect mobile number / member ID or password';

// Members log in with their mobile number or member ID + password (Supabase Auth behind the scenes).
export const POST = publicRoute(async (req) => {
  const b = await body(req);
  const id = str(b.id);
  const password = str(b.password);
  if (!id.trim() || !password) return fail(WRONG, 401);

  const login = await findMemberLogin(id);
  if (!login?.auth_email) return fail(WRONG, 401);
  if (login.status === 'suspended') return fail('This membership is suspended. Please contact the office.', 403);

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email: login.auth_email, password });
  if (error) return fail(error.status === 429 ? 'Too many attempts. Please wait a minute and try again.' : WRONG, error.status === 429 ? 429 : 401);

  const { data: member } = await supabase.from('members').select(MEMBER_COLUMNS).eq('id', login.id).single();
  return ok({ member });
});
