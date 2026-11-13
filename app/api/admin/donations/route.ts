import { ok, adminRoute } from '@/lib/http';
import { createClient } from '@/lib/supabase/server';
import { searchTerm } from '@/lib/utils';

export const GET = adminRoute(async (req) => {
  const q = searchTerm(new URL(req.url).searchParams.get('q'));
  const supabase = await createClient();
  let query = supabase.from('donations').select('*, campaigns(title_en)').order('id', { ascending: false }).limit(1000);
  if (q) query = query.or(['name', 'phone', 'receipt_no'].map((c) => `${c}.ilike.%${q}%`).join(','));
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  const items = (data ?? []).map(({ campaigns, ...d }) => ({ ...d, campaign: campaigns?.title_en ?? null }));
  return ok({ items });
});
