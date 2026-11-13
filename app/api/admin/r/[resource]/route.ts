import { refreshContent } from '@/lib/revalidate';
import { ok, fail, body, adminRoute } from '@/lib/http';
import { createClient } from '@/lib/supabase/server';
import { RESOURCES, isResourceName } from '@/lib/resources';
import { cleanRow, uniqueSlug, listResource } from '@/lib/crud';

type Params = { resource: string };

export const GET = adminRoute<Params>(async (_req, { params }) => {
  const { resource } = await params;
  if (!isResourceName(resource)) return fail('Unknown resource', 404);
  const supabase = await createClient();
  return ok({ items: await listResource(supabase, RESOURCES[resource]) });
});

export const POST = adminRoute<Params>(async (req, { params }) => {
  const { resource } = await params;
  if (!isResourceName(resource)) return fail('Unknown resource', 404);
  const R = RESOURCES[resource];
  const { row, error } = cleanRow(R, await body(req));
  if (!row) return fail(error);
  const supabase = await createClient();
  if (R.slugFrom && (R.table === 'news' || R.table === 'campaigns')) row.slug = await uniqueSlug(supabase, R.table, String(row[R.slugFrom]));
  // Row shape is validated by cleanRow against the resource config.
  const { data, error: dbError } = await supabase.from(R.table).insert(row as never).select('*').single();
  if (dbError) return fail(dbError.message, dbError.code === '42501' ? 403 : 400);
  refreshContent(R.table);
  return ok({ item: data });
});
