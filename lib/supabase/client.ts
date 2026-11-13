'use client';
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './database.types';
import { requireSupabaseEnv } from './env';

let browserClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

/** Browser client (shares the session cookies set by the server). Used for admin uploads to Storage. */
export function createClient() {
  if (!browserClient) {
    const { url, anonKey } = requireSupabaseEnv();
    browserClient = createBrowserClient<Database>(url, anonKey);
  }
  return browserClient;
}
