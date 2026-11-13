import { ok, adminRoute } from '@/lib/http';
import { createClient } from '@/lib/supabase/server';
import type { AdminStats } from '@/lib/types';


export const GET = adminRoute(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('admin_stats');
  if (error) throw new Error(error.message);
  return ok(data as unknown as AdminStats);
});
