import { refreshContent } from '@/lib/revalidate';
import { ok, body, adminRoute } from '@/lib/http';
import { createClient } from '@/lib/supabase/server';
import { SETTINGS_KEYS } from '@/lib/resources';
import type { Settings } from '@/lib/types';

async function load(): Promise<Settings> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('settings').select('key, value');
  if (error) throw new Error(error.message);
  return Object.fromEntries((data ?? []).map((r) => [r.key, r.value ?? '']));
}

export const GET = adminRoute(async () => ok({ settings: await load() }));

export const PUT = adminRoute(async (req) => {
  const b = await body(req);
  const rows = SETTINGS_KEYS.filter((k) => k in b).map((key) => ({ key, value: b[key] == null ? '' : String(b[key]) }));
  if (rows.length) {
    const supabase = await createClient();
    const { error } = await supabase.from('settings').upsert(rows, { onConflict: 'key' });
    if (error) throw new Error(error.message);
  }
  refreshContent('settings');
  return ok({ settings: await load() });
});
