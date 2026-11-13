import { ok, publicRoute } from '@/lib/http';
import { getAdmin } from '@/lib/auth';
import { paymentMode } from '@/lib/payments';
import { supabaseConfigured } from '@/lib/supabase/env';

export const GET = publicRoute(async () =>
  ok({ admin: await getAdmin(), paymentMode: paymentMode(), supabase: supabaseConfigured() }));
