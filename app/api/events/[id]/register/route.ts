import { ok, fail, publicRoute } from '@/lib/http';
import { getParticipant } from '@/lib/auth';
import { createServiceClient } from '@/lib/supabase/admin';
import { registrationCount } from '@/lib/events';
import { campaignStatus } from '@/lib/utils';
import type { Participant } from '@/lib/types';
import type { TablesInsert } from '@/lib/supabase/database.types';

type Params = { id: string };
type Ready = { ok: true; who: Participant; eventId: number; db: ReturnType<typeof createServiceClient> };
type Refused = { ok: false; error: Response };

/** Checks: a signed-in, active member or volunteer and an event that has not ended. */
async function prepare(idParam: string): Promise<Ready | Refused> {
  const who = await getParticipant({ fresh: true }); // status must be current (suspensions apply at once)
  if (!who) return { ok: false, error: fail('Please log in as a member or volunteer to register for events.', 401) };
  if (who.status === 'suspended') return { ok: false, error: fail('Your account is suspended. Please contact the office.', 403) };
  const id = Number(idParam);
  if (!Number.isInteger(id) || id < 1) return { ok: false, error: fail('Event not found', 404) };
  const db = createServiceClient();
  const { data: event } = await db.from('campaigns').select('id, start_date, end_date').eq('id', id).maybeSingle();
  if (!event) return { ok: false, error: fail('Event not found', 404) };
  if (campaignStatus(event) === 'completed') return { ok: false, error: fail('This event has ended. Registration is closed.', 400) };
  return { ok: true, who, eventId: event.id, db };
}

// Register the logged-in member or volunteer for the event (safe to call twice). Free for both.
export const POST = publicRoute<Params>(async (_req, { params }) => {
  const r = await prepare((await params).id);
  if (!r.ok) return r.error;
  const row: TablesInsert<'event_registrations'> = r.who.kind === 'member'
    ? { campaign_id: r.eventId, member_id: r.who.id }
    : { campaign_id: r.eventId, volunteer_id: r.who.id };
  const { error } = await r.db.from('event_registrations')
    .upsert(row, { onConflict: r.who.kind === 'member' ? 'campaign_id,member_id' : 'campaign_id,volunteer_id', ignoreDuplicates: true });
  if (error) throw new Error(error.message);
  return ok({ registered: true, count: await registrationCount(r.eventId) });
});

// Members cannot cancel online; the office removes a registration from the admin panel if needed.
