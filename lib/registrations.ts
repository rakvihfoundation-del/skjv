import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './supabase/database.types';
import type { RegistrationRow } from './types';

type Person = { name: string; phone: string; ward: string | null; status: string };
type RegRow = {
  id: number; created_at: string; campaign_id: number; campaigns: { title_en: string } | null;
  members: (Person & { member_no: string | null }) | null; volunteers?: (Person & { volunteer_no: string | null }) | null;
};

/** Registrations joined with the member and event (admin only — RLS limits others to their own rows). */
export async function loadRegistrations(db: SupabaseClient<Database>, campaignId: number | null): Promise<RegistrationRow[]> {
  const query = (withVolunteers: boolean) => {
    let q = db.from('event_registrations')
      .select(withVolunteers
        ? 'id, created_at, campaign_id, campaigns(title_en), members(member_no, name, phone, ward, status), volunteers(volunteer_no, name, phone, ward, status)'
        : 'id, created_at, campaign_id, campaigns(title_en), members(member_no, name, phone, ward, status)')
      .order('created_at', { ascending: false }).limit(5000);
    if (campaignId) q = q.eq('campaign_id', campaignId);
    return q;
  };
  let { data, error } = await query(true) as { data: RegRow[] | null; error: { message: string } | null };
  // Until the volunteers SQL has been run there is no volunteers table: fall back to members only.
  if (error && /volunteers/i.test(error.message)) ({ data, error } = await query(false) as { data: RegRow[] | null; error: { message: string } | null });
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => {
    const p = r.members ?? r.volunteers ?? null; // a registration belongs to a member OR a volunteer
    return {
      id: r.id, created_at: r.created_at, campaign_id: r.campaign_id, campaign: r.campaigns?.title_en ?? '',
      kind: r.members ? 'member' as const : 'volunteer' as const,
      member_no: r.members?.member_no ?? r.volunteers?.volunteer_no ?? null, name: p?.name ?? '', phone: p?.phone ?? '',
      ward: p?.ward ?? null, status: p?.status ?? '',
    };
  });
}
