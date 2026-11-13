import { ok, body, adminRoute } from '@/lib/http';
import { createClient } from '@/lib/supabase/server';

type Params = { id: string };

export const PATCH = adminRoute<Params>(async (req, { params }) => {
  const id = Number((await params).id);
  const { is_read } = await body(req);
  const supabase = await createClient();
  const { error } = await supabase.from('messages').update({ is_read: Boolean(is_read) }).eq('id', id);
  if (error) throw new Error(error.message);
  return ok({ ok: true });
});

export const DELETE = adminRoute<Params>(async (_req, { params }) => {
  const id = Number((await params).id);
  const supabase = await createClient();
  const { error } = await supabase.from('messages').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return ok({ ok: true });
});
