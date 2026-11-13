import { ok, adminRoute } from '@/lib/http';
import { createClient } from '@/lib/supabase/server';
import { loadRegistrations } from '@/lib/registrations';
import { getCampaigns } from '@/lib/queries';

// Registrations (optionally for one event) plus a per-event count for the filter.
// Event names come from the cached campaign list; counts and rows are fetched in parallel.
export const GET = adminRoute(async (req) => {
  const campaign = Number(new URL(req.url).searchParams.get('campaign')) || null;
  const supabase = await createClient();
  const [items, campaigns, counts] = await Promise.all([
    loadRegistrations(supabase, campaign),
    getCampaigns(),
    supabase.from('event_registrations').select('campaign_id').limit(100000),
  ]);
  if (counts.error) throw new Error(counts.error.message);
  const per = new Map<number, number>();
  for (const r of counts.data ?? []) per.set(r.campaign_id, (per.get(r.campaign_id) ?? 0) + 1);
  const events = [...campaigns]
    .sort((a, b) => b.start_date.localeCompare(a.start_date))
    .map((e) => ({ id: e.id, title: e.title_en, start_date: e.start_date, count: per.get(e.id) ?? 0 }));
  return ok({ items, events });
});
