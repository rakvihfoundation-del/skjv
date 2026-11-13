import { ok, fail, adminRoute } from '@/lib/http';
import { createClient } from '@/lib/supabase/server';

type Params = { id: string };

// Remove one registration (e.g. a member asked to be taken off the list).
export const DELETE = adminRoute<Params>(async (_req, { params }) => {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) return fail('Not found', 404);
  const supabase = await createClient();
  const { error } = await supabase.from('event_registrations').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return ok({ ok: true });
});
