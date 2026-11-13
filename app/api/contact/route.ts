import { ok, fail, body, str, publicRoute } from '@/lib/http';
import { createServiceClient } from '@/lib/supabase/admin';
import { EMAIL_RE } from '@/lib/utils';

export const POST = publicRoute(async (req) => {
  const b = await body(req);
  const name = str(b.name).trim().slice(0, 120);
  const email = str(b.email).trim().slice(0, 160);
  const message = str(b.message).trim().slice(0, 4000);
  if (name.length < 2) return fail('Please enter your name');
  if (email && !EMAIL_RE.test(email)) return fail('Please enter a valid email');
  if (message.length < 5) return fail('Please write a message');
  const { error } = await createServiceClient().from('messages').insert({
    name, email: email || null, phone: str(b.phone).slice(0, 20) || null, subject: str(b.subject).slice(0, 200) || null, message,
  });
  if (error) throw new Error(error.message);
  return ok({ ok: true });
});
