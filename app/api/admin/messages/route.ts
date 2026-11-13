import { ok, adminRoute } from '@/lib/http';
import { createClient } from '@/lib/supabase/server';

export const GET = adminRoute(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.from('messages').select('*').order('id', { ascending: false }).limit(500);
  if (error) throw new Error(error.message);
  return ok({ items: data ?? [] });
});
