// Supabase connection settings, read from environment variables (.env.local).
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

/** True once the public URL and anon key are set. */
export const supabaseConfigured = (): boolean => Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export class SupabaseNotConfiguredError extends Error {
  constructor(what = 'NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY') {
    super(`Supabase is not connected yet. Add ${what} to .env.local.`);
    this.name = 'SupabaseNotConfiguredError';
  }
}

export function requireSupabaseEnv(): { url: string; anonKey: string } {
  if (!supabaseConfigured()) throw new SupabaseNotConfiguredError();
  return { url: SUPABASE_URL, anonKey: SUPABASE_ANON_KEY };
}

/** Public storage buckets created by the migration. */
/** `proofs` is PRIVATE (volunteer ID proofs); the others are public. */
export const BUCKETS = { media: 'media', members: 'members', proofs: 'proofs' } as const;

/** Public URL prefix of a storage bucket, e.g. https://xyz.supabase.co/storage/v1/object/public/members/ */
export const publicBucketUrl = (bucket: string): string => `${SUPABASE_URL}/storage/v1/object/public/${bucket}/`;
