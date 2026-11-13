import { ok, adminRoute } from '@/lib/http';
import { createClient } from '@/lib/supabase/server';
import { MEMBER_COLUMNS } from '@/lib/auth';
import { searchTerm } from '@/lib/utils';

export const GET = adminRoute(async (req) => {
  const u = new URL(req.url);
  const q = searchTerm(u.searchParams.get('q'));
  const ward = u.searchParams.get('ward') || '';
  const status = u.searchParams.get('status') || '';
  const supabase = await createClient();
  let query = supabase.from('members').select(MEMBER_COLUMNS).order('id', { ascending: false }).limit(1000);
  if (q) query = query.or(['name', 'phone', 'member_no', 'email', 'pincode'].map((c) => `${c}.ilike.%${q}%`).join(','));
  if (ward) query = query.eq('ward', ward);
  if (status === 'active' || status === 'suspended') query = query.eq('status', status);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return ok({ items: data ?? [] });
});
