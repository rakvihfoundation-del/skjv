import { ok, fail, body, str, publicRoute } from '@/lib/http';
import { createClient } from '@/lib/supabase/server';
import { rememberAdmin } from '@/lib/auth';

// Admins are Supabase Auth users that are listed in the `admins` table.
export const POST = publicRoute(async (req) => {
  const b = await body(req);
  const email = str(b.email).trim().toLowerCase();
  const password = str(b.password);
  if (!email || !password) return fail('Invalid email or password', 401);

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    return fail(error?.status === 429 ? 'Too many attempts. Please wait a minute.' : 'Invalid email or password', error?.status === 429 ? 429 : 401);
  }
  const { data: admin } = await supabase.from('admins').select('user_id, name, email').eq('user_id', data.user.id).maybeSingle();
  if (!admin) {
    await supabase.auth.signOut();
    return fail('This account does not have admin access', 403);
  }
  const me = { id: admin.user_id, name: admin.name, email: admin.email };
  rememberAdmin(data.user.id, me);
  return ok({ admin: me });
});
