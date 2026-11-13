import 'server-only';
import { createClient, createPublicClient } from './supabase/server';
import { supabaseConfigured } from './supabase/env';
import { campaignStatus } from './utils';
import type { MyEvent, Participant, RegistrationInfo } from './types';

/** How many members registered for an event (public, via a security-definer function). */
export async function registrationCount(campaignId: number): Promise<number> {
  if (!supabaseConfigured()) return 0;
  const { data, error } = await createPublicClient().rpc('event_registration_count', { p_campaign_id: campaignId });
  if (error) return 0; // e.g. the registrations SQL has not been run yet
  return Number(data) || 0;
}

/** Registration status of an event for the current visitor. */
export async function registrationInfo(campaignId: number, who: Participant | null): Promise<RegistrationInfo> {
  // The public count and the visitor's own registration are fetched in parallel.
  const own = async () => {
    if (!who) return false;
    const supabase = await createClient();
    const { data } = await supabase.from('event_registrations').select('id')
      .eq('campaign_id', campaignId).eq(who.kind === 'member' ? 'member_id' : 'volunteer_id', who.id).maybeSingle();
    return !!data;
  };
  const [count, registered] = await Promise.all([registrationCount(campaignId), own()]);
  return { registered, count };
}

/** Events the member registered for, newest event first. */
export async function myEvents(who: Participant): Promise<MyEvent[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('event_registrations')
    .select('created_at, campaigns(id, slug, title_en, title_kn, start_date, end_date, time, venue_en, venue_kn, image)')
    .eq(who.kind === 'member' ? 'member_id' : 'volunteer_id', who.id);
  if (error || !data) return [];
  return data
    .flatMap((r) => (r.campaigns ? [{ ...r.campaigns, registered_at: r.created_at, status: campaignStatus(r.campaigns) }] : []))
    .sort((a, b) => (a.start_date < b.start_date ? 1 : -1));
}
