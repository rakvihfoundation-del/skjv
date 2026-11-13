import { refreshContent } from '@/lib/revalidate';
import { ok, fail, body, adminRoute } from '@/lib/http';
import { createClient } from '@/lib/supabase/server';
import { RESOURCES, isResourceName } from '@/lib/resources';
import { cleanRow } from '@/lib/crud';

type Params = { resource: string; id: string };

export const PUT = adminRoute<Params>(async (req, { params }) => {
  const { resource, id } = await params;
  if (!isResourceName(resource)) return fail('Unknown resource', 404);
  const R = RESOURCES[resource];
  const { row, error } = cleanRow(R, await body(req));
  if (!row) return fail(error);
  const supabase = await createClient();
  const { data, error: dbError } = await supabase.from(R.table).update(row as never).eq('id', Number(id)).select('*').maybeSingle();
  if (dbError) return fail(dbError.message, dbError.code === '42501' ? 403 : 400);
  if (!data) return fail('Not found', 404);
  refreshContent(R.table);
  return ok({ item: data });
});

export const DELETE = adminRoute<Params>(async (_req, { params }) => {
  const { resource, id } = await params;
  if (!isResourceName(resource)) return fail('Unknown resource', 404);
  const supabase = await createClient();
  const { error } = await supabase.from(RESOURCES[resource].table).delete().eq('id', Number(id));
  if (error) throw new Error(error.message);
  refreshContent(RESOURCES[resource].table);
  return ok({ ok: true });
});
