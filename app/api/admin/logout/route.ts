import { ok, publicRoute } from '@/lib/http';
import { createClient } from '@/lib/supabase/server';

export const POST = publicRoute(async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return ok({ ok: true });
});
