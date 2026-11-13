import 'server-only';
import { cache } from 'react';
import { createClient } from './supabase/server';
import { createServiceClient } from './supabase/admin';
import { supabaseConfigured } from './supabase/env';
import type { AdminUser, MemberPublic, Participant, VolunteerPublic } from './types';

export const MEMBER_COLUMNS = 'id, member_no, name, email, phone, ward, pincode, photo, status, created_at, amount, payment_mode' as const;

export const VOLUNTEER_COLUMNS = 'id, volunteer_no, name, email, phone, ward, pincode, proof_type, verified, status, created_at' as const;

/** The private Supabase Auth e-mail for a volunteer (separate from a member login with the same phone). */
export function volunteerAuthEmail(phone: string): string {
  const domain = (process.env.MEMBER_AUTH_EMAIL_DOMAIN || 'members.skjv.org').replace(/^@/, '');
  return `v${phone}@${domain}`.toLowerCase();
}

/** The private Supabase Auth e-mail for a member (members log in with phone / member ID). */
export function memberAuthEmail(phone: string): string {
  const domain = (process.env.MEMBER_AUTH_EMAIL_DOMAIN || 'members.skjv.org').replace(/^@/, '');
  return `m${phone}@${domain}`.toLowerCase();
}

/**
 * The signed-in user, or null.
 * Uses getClaims(): the session JWT is verified locally against the project's public signing key
 * (ES256), so no round trip to the Auth server is needed on every request. Memoised per request.
 */
export const getUser = cache(async (): Promise<{ id: string; email: string | null } | null> => {
  if (!supabaseConfigured()) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const sub = data?.claims?.sub;
  if (error || !sub) return null;
  return { id: String(sub), email: typeof data.claims.email === 'string' ? data.claims.email : null };
});

// Admin lookups are remembered briefly so each admin click does not re-query the admins table.
// Removing someone from `admins` therefore takes effect within ADMIN_TTL.
const ADMIN_TTL = 60_000;
const adminCache = new Map<string, { at: number; admin: AdminUser | null }>();

/** Records a fresh admin lookup (used right after login so the dashboard does not look it up again). */
export function rememberAdmin(userId: string, admin: AdminUser | null): void {
  adminCache.set(userId, { at: Date.now(), admin });
}

/** The signed-in admin, or null when the visitor is not an admin. */
export const getAdmin = cache(async (): Promise<AdminUser | null> => {
  const user = await getUser();
  if (!user) return null;
  const hit = adminCache.get(user.id);
  if (hit && Date.now() - hit.at < ADMIN_TTL) return hit.admin;
  const supabase = await createClient();
  const { data, error } = await supabase.from('admins').select('user_id, name, email').eq('user_id', user.id).maybeSingle();
  if (error) return null; // do not cache failures
  const admin = data ? { id: data.user_id, name: data.name, email: data.email } : null;
  if (adminCache.size > 500) adminCache.clear();
  adminCache.set(user.id, { at: Date.now(), admin });
  return admin;
});

// The member's own record is remembered for a short time so moving between pages does not wait
// for Supabase each time. Admin changes (suspend / delete) clear it at once via forgetMember().
const MEMBER_TTL = 30_000;
const memberCache = new Map<string, { at: number; member: MemberPublic | null }>();

/** Drops the remembered member record (all of them when no user id is given). */
export function forgetMember(userId?: string | null): void {
  if (userId) memberCache.delete(userId);
  else memberCache.clear();
}

/**
 * The signed-in member's own record (read through RLS), or null.
 * NOTE: each server route keeps its own copy of this short-lived memory, so anything that decides what a
 * person is ALLOWED to do (e.g. event registration) must use getParticipant({ fresh: true }).
 */
export const getMember = cache(async (): Promise<MemberPublic | null> => loadMember(false));

async function loadMember(fresh: boolean): Promise<MemberPublic | null> {
  const user = await getUser();
  if (!user) return null;
  const hit = memberCache.get(user.id);
  if (!fresh && hit && Date.now() - hit.at < MEMBER_TTL) return hit.member;
  const supabase = await createClient();
  const { data, error } = await supabase.from('members').select(MEMBER_COLUMNS).eq('user_id', user.id).maybeSingle();
  if (error) return null; // do not cache failures
  if (memberCache.size > 2000) memberCache.clear();
  memberCache.set(user.id, { at: Date.now(), member: data ?? null });
  return data ?? null;
}

/**
 * Finds the login e-mail for a mobile number or member ID (service role — never exposed to the browser).
 * Returns null when there is no such member.
 */
export async function findMemberLogin(identifier: string) {
  const key = identifier.trim();
  const phone = key.replace(/\D/g, '').slice(-10);
  const db = createServiceClient();
  let query = db.from('members').select('id, auth_email, status, user_id');
  query = /^skjv-/i.test(key) ? query.eq('member_no', key.toUpperCase()) : query.eq('phone', phone);
  const { data } = await query.maybeSingle();
  return data;
}

// ---------------------------------------------------------------------------------------------
// Volunteers (free sign-up, no ID card). Same pattern as members.
// ---------------------------------------------------------------------------------------------
const volunteerCache = new Map<string, { at: number; volunteer: VolunteerPublic | null }>();

export function forgetVolunteer(userId?: string | null): void {
  if (userId) volunteerCache.delete(userId);
  else volunteerCache.clear();
}

/** The signed-in volunteer's own record (read through RLS), or null. Same caching note as getMember. */
export const getVolunteer = cache(async (): Promise<VolunteerPublic | null> => loadVolunteer(false));

async function loadVolunteer(fresh: boolean): Promise<VolunteerPublic | null> {
  const user = await getUser();
  if (!user) return null;
  const hit = volunteerCache.get(user.id);
  if (!fresh && hit && Date.now() - hit.at < MEMBER_TTL) return hit.volunteer;
  const supabase = await createClient();
  const { data, error } = await supabase.from('volunteers').select(VOLUNTEER_COLUMNS).eq('user_id', user.id).maybeSingle();
  if (error) return null;
  if (volunteerCache.size > 2000) volunteerCache.clear();
  volunteerCache.set(user.id, { at: Date.now(), volunteer: data ?? null });
  return data ?? null;
}

/**
 * Whoever is logged in on the website (member or volunteer), or null.
 * Pass { fresh: true } when the answer decides what they may do (always reads the database).
 */
export const getParticipant = cache(async (opts?: { fresh?: boolean }): Promise<Participant | null> => {
  const fresh = opts?.fresh === true;
  const [m, v] = await Promise.all(fresh ? [loadMember(true), loadVolunteer(true)] : [getMember(), getVolunteer()]);
  if (m) return { kind: 'member', id: m.id, name: m.name, status: m.status, number: m.member_no };
  if (v) return { kind: 'volunteer', id: v.id, name: v.name, status: v.status, number: v.volunteer_no };
  return null;
});

/** Finds the login e-mail for a volunteer's mobile number or volunteer ID (service role). */
export async function findVolunteerLogin(identifier: string) {
  const key = identifier.trim();
  const phone = key.replace(/\D/g, '').slice(-10);
  const db = createServiceClient();
  let query = db.from('volunteers').select('id, auth_email, status, user_id');
  query = /^skjv-vol-/i.test(key) ? query.eq('volunteer_no', key.toUpperCase()) : query.eq('phone', phone);
  const { data } = await query.maybeSingle();
  return data;
}
