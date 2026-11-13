// Domain types shared by server and client code.
import type { Tables } from './supabase/database.types';

export type Lang = 'en' | 'kn';

/** Key/value site settings (all values are strings, as stored). */
export type Settings = Record<string, string>;

export type Slide = Pick<Tables<'slides'>, 'id' | 'image' | 'title' | 'link'>;
export type News = Tables<'news'>;
export type NewsListItem = Omit<News, 'body_en' | 'body_kn' | 'created_at'>;
export type GalleryItem = Tables<'gallery'>;
export type Leader = Tables<'leaders'>;
export type Partner = Tables<'partners'>;
export type InstagramPost = Tables<'instagram'>;

export type CampaignStatus = 'upcoming' | 'ongoing' | 'completed';
export type CampaignRow = Tables<'campaigns'>;
export type Campaign = CampaignRow & { status: CampaignStatus };

/** Event registration status for the current visitor. */
export type RegistrationInfo = { registered: boolean; count: number };
/** An event the member registered for (shown on the My ID Card page). */
export type MyEvent = Pick<CampaignRow, 'id' | 'slug' | 'title_en' | 'title_kn' | 'start_date' | 'end_date' | 'time' | 'venue_en' | 'venue_kn' | 'image'>
  & { status: CampaignStatus; registered_at: string };
/** A registration as listed in the admin panel. */
export type RegistrationRow = {
  id: number; created_at: string; campaign_id: number; campaign: string; kind: 'member' | 'volunteer';
  member_no: string | null; name: string; phone: string; ward: string | null; status: string;
};

/** ID proof a volunteer can upload (any one). */
export const PROOF_TYPES = ['aadhaar', 'voter', 'driving', 'pan'] as const;
export type ProofType = (typeof PROOF_TYPES)[number];

/** Volunteer fields that are safe to send to the browser (never the proof file path). */
export type VolunteerPublic = Pick<
  Tables<'volunteers'>,
  'id' | 'volunteer_no' | 'name' | 'email' | 'phone' | 'ward' | 'pincode' | 'proof_type' | 'verified' | 'status' | 'created_at'
>;

/** Whoever is logged in on the website: a paid member or a free volunteer. */
export type Participant =
  | { kind: 'member'; id: number; name: string; status: string; number: string | null }
  | { kind: 'volunteer'; id: number; name: string; status: string; number: string | null };

/** Member fields that are safe to send to the browser. */
export type MemberPublic = Pick<
  Tables<'members'>,
  'id' | 'member_no' | 'name' | 'email' | 'phone' | 'ward' | 'pincode' | 'photo' | 'status' | 'created_at' | 'amount' | 'payment_mode'
>;

/** What the public QR verification page shows. */
export type VerifiedMember = { member_no: string; name: string; ward: string | null; photo: string | null; status: string; created_at: string };

/** What the ID card needs (also used for the live preview while signing up). */
export type CardMember = {
  id?: number;
  name: string;
  member_no?: string | null;
  phone?: string | null;
  ward?: string | null;
  pincode?: string | null;
  photo?: string | null;
  created_at?: string | null;
};

export type DonationReceipt = {
  receipt_no: string | null;
  name: string;
  amount: number;
  created_at: string;
  payment_id: string | null;
  pan: string | null;
  email: string | null;
  phone: string | null;
};

export type AdminUser = { id: string; name: string; email: string };

/** A row with optional `<field>_en` / `<field>_kn` columns. */
export type Localised = object | null | undefined;

/** Sign-up form held in pending_orders until the payment is verified. */
export type MembershipPayload = {
  name: string;
  email: string | null;
  phone: string;
  ward: string;
  pincode: string;
  photo: string | null;
  password_hash: string;
};

/** Donation form held in pending_orders until the payment is verified. */
export type DonationPayload = {
  name: string;
  email: string | null;
  phone: string;
  pan: string | null;
  amount: number;
  campaign_id: number | null;
  message: string;
  anonymous: boolean;
};

/** Admin dashboard numbers (from the admin_stats() database function). */
export type AdminStats = {
  members: number;
  membersMonth: number;
  volunteers?: number;
  volunteersMonth?: number;
  membershipRevenue: number;
  donationsTotal: number;
  donationsCount: number;
  unread: number;
  upcoming: number;
  months: { key: string; label: string; members: number; donations: number }[];
  wards: { ward: string | null; c: number }[];
  recentMembers: { id: number; member_no: string; name: string; ward: string | null; photo: string | null; created_at: string }[];
  recentDonations: { id: number; receipt_no: string; name: string; amount: number; anonymous: boolean; created_at: string }[];
};
