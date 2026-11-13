import 'server-only';
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import { requireSupabaseEnv, SupabaseNotConfiguredError } from './env';

/**
 * Service-role client: bypasses row-level security. SERVER ONLY.
 * Used only for trusted work after our own checks — creating members after a verified payment,
 * recording donations, storing contact messages, resolving a member's login e-mail, uploading
 * sign-up photos and managing auth users.
 */
export function createServiceClient() {
  const { url } = requireSupabaseEnv();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new SupabaseNotConfiguredError('SUPABASE_SERVICE_ROLE_KEY');
  return createClient<Database>(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
