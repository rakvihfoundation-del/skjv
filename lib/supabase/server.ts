import 'server-only';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient as createPlainClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import { requireSupabaseEnv } from './env';

/**
 * Supabase client bound to the visitor's session cookies.
 * Use in Server Components, Route Handlers and Server Actions. Row-level security applies
 * as the signed-in user (member or admin), or as `anon` when nobody is signed in.
 */
export async function createClient() {
  const { url, anonKey } = requireSupabaseEnv();
  const cookieStore = await cookies();
  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) cookieStore.set(name, value, options);
        } catch {
          // Called from a Server Component, where cookies are read-only.
          // The proxy refreshes the session, so this can be ignored.
        }
      },
    },
  });
}

/** Anonymous client for public content (no cookies) — always reads as `anon` under RLS. */
export function createPublicClient() {
  const { url, anonKey } = requireSupabaseEnv();
  return createPlainClient<Database>(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
}
