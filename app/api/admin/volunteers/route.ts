import { ok, adminRoute } from '@/lib/http';
import { createClient } from '@/lib/supabase/server';
import { VOLUNTEER_COLUMNS } from '@/lib/auth';
import { searchTerm } from '@/lib/utils';

// Volunteers list for the admin panel (search, ward, status, verification filters).
export const GET = adminRoute(async (req) => {
  const u = new URL(req.url);
  const q = searchTerm(u.searchParams.get('q'));
  const ward = u.searchParams.get('ward') || '';
  const status = u.searchParams.get('status') || '';
  const supabase = await createClient();
  let query = supabase.from('volunteers').select(VOLUNTEER_COLUMNS).order('id', { ascending: false }).limit(2000);
  if (q) query = query.or(['name', 'phone', 'volunteer_no', 'email', 'pincode'].map((c) => `${c}.ilike.%${q}%`).join(','));
  if (ward) query = query.eq('ward', ward);
  if (status === 'active' || status === 'suspended') query = query.eq('status', status);
  if (status === 'verified') query = query.eq('verified', true);
  if (status === 'unverified') query = query.eq('verified', false);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return ok({ items: data ?? [] });
});
