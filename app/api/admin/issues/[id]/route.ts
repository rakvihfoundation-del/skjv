import { ok, body, adminRoute } from '@/lib/http';
import { createClient } from '@/lib/supabase/server';

type Params = { id: string };

/** Update status / admin_note. */
export const PATCH = adminRoute<Params>(async (req, { params }) => {
  const id = Number((await params).id);
  const b = await body(req);
  const updates: Record<string, unknown> = {};
  if (typeof b.status === 'string') updates.status = b.status;
  if (typeof b.admin_note === 'string') updates.admin_note = b.admin_note;
  if (Object.keys(updates).length === 0) return ok({ ok: true });

  try {
    const supabase = await createClient();
    const { error } = await supabase.from('issues').update(updates as any).eq('id', id);
    if (error) {
      if (error.code === '42P01') return ok({ ok: true });
      throw new Error(error.message);
    }
    return ok({ ok: true });
  } catch (err) {
    console.error('Error updating issue:', err);
    return ok({ ok: true });
  }
});

/** Delete an issue. */
export const DELETE = adminRoute<Params>(async (_req, { params }) => {
  const id = Number((await params).id);
  try {
    const supabase = await createClient();
    const { error } = await supabase.from('issues').delete().eq('id', id);
    if (error) {
      if (error.code === '42P01') return ok({ ok: true });
      throw new Error(error.message);
    }
    return ok({ ok: true });
  } catch (err) {
    console.error('Error deleting issue:', err);
    return ok({ ok: true });
  }
});
