import { ok, fail, body, str, publicRoute } from '@/lib/http';
import { createClient } from '@/lib/supabase/server';
import { findVolunteerLogin, VOLUNTEER_COLUMNS } from '@/lib/auth';

const WRONG = 'Incorrect mobile number / volunteer ID or password';

// Volunteers log in with their mobile number or volunteer ID + password.
export const POST = publicRoute(async (req) => {
  const b = await body(req);
  const id = str(b.id);
  const password = str(b.password);
  if (!id.trim() || !password) return fail(WRONG, 401);

  const login = await findVolunteerLogin(id);
  if (!login?.auth_email) return fail(WRONG, 401);
  if (login.status === 'suspended') return fail('This volunteer account is suspended. Please contact the office.', 403);

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email: login.auth_email, password });
  if (error) return fail(error.status === 429 ? 'Too many attempts. Please wait a minute and try again.' : WRONG, error.status === 429 ? 429 : 401);

  const { data: volunteer } = await supabase.from('volunteers').select(VOLUNTEER_COLUMNS).eq('id', login.id).single();
  return ok({ volunteer });
});
