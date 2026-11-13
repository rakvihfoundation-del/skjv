import 'server-only';
import { unstable_cache } from 'next/cache';
import { createPublicClient } from './supabase/server';
import { supabaseConfigured } from './supabase/env';
import { campaignStatus, todayISO } from './utils';
import { LEADER_TIERS } from './resources';
import type { ContentTag } from './content-tags';
import type {
  Campaign, GalleryItem, InstagramPost, Leader, News, NewsListItem, Partner, Settings, Slide, VerifiedMember,
} from './types';

// Public website reads. They use the anonymous client, so row-level security limits them
// to public content (e.g. only active banners).

// Until Supabase is connected the layouts show a setup notice; data functions return empty results
// so pages rendered alongside do not throw.
const off = () => !supabaseConfigured();

/**
 * Public content is cached on the server (tagged by table) so pages do not wait for Supabase on
 * every visit. The admin panel clears the matching tag whenever it saves (see lib/revalidate.ts),
 * and the cache also refreshes on its own every 10 minutes as a safety net.
 */
export { CONTENT_TAGS, type ContentTag } from './content-tags';
const cached = <A extends unknown[], R>(fn: (...args: A) => Promise<R>, key: string, tag: ContentTag) =>
  unstable_cache(fn, ['skjv', key], { tags: [tag], revalidate: 600 });

function must<T>(res: { data: T | null; error: { message: string } | null }, what: string): T {
  if (res.error) throw new Error(`Could not load ${what}: ${res.error.message}`);
  return (res.data ?? ([] as unknown)) as T;
}

const settingsRows = cached(async () => must(await createPublicClient().from('settings').select('key, value'), 'settings'), 'settings', 'settings');

export async function getSettings(): Promise<Settings> {
  if (off()) return { membership_fee: '1500' };
  const rows = await settingsRows();
  const s: Settings = {};
  for (const r of rows) s[r.key] = r.value ?? '';
  if (!s.membership_fee) s.membership_fee = '1500';
  return s;
}

/** Membership fee in rupees, from settings. */
export async function getMembershipFee(): Promise<number> {
  if (off()) return 1500;
  const fee = Number((await getSettings()).membership_fee);
  return Number.isFinite(fee) && fee > 0 ? fee : 1500;
}

async function getSlidesUncached(): Promise<Slide[]> {
  if (off()) return [];
  return must(
    await createPublicClient().from('slides').select('id, image, title, link').eq('active', true).order('sort').order('id'),
    'banners',
  );
}

async function getGalleryUncached(limit = 500): Promise<GalleryItem[]> {
  if (off()) return [];
  return must(
    await createPublicClient().from('gallery').select('*').order('sort').order('id', { ascending: false }).limit(limit),
    'gallery',
  );
}

const tierRank = (t: string) => {
  const i = (LEADER_TIERS as readonly string[]).indexOf(t);
  return i === -1 ? LEADER_TIERS.length : i;
};

async function getLeadersUncached(): Promise<Leader[]> {
  if (off()) return [];
  const rows = must(await createPublicClient().from('leaders').select('*').order('sort').order('id'), 'leaders');
  return rows.sort((a, b) => tierRank(a.tier) - tierRank(b.tier));
}

async function getFoundersUncached(): Promise<Leader[]> {
  if (off()) return [];
  return must(await createPublicClient().from('leaders').select('*').eq('tier', 'founder').order('sort').order('id'), 'founders');
}

async function getPartnersUncached(): Promise<Partner[]> {
  if (off()) return [];
  return must(await createPublicClient().from('partners').select('*').order('sort').order('id'), 'partners');
}

async function getInstagramUncached(limit = 6): Promise<InstagramPost[]> {
  if (off()) return [];
  return must(
    await createPublicClient().from('instagram').select('*').order('sort').order('id', { ascending: false }).limit(limit),
    'Instagram posts',
  );
}

const NEWS_LIST = 'id, slug, title_en, title_kn, category, published_at, excerpt_en, excerpt_kn, image, images, featured' as const;

async function getNewsUncached(limit = 100): Promise<NewsListItem[]> {
  if (off()) return [];
  return must(
    await createPublicClient().from('news').select(NEWS_LIST)
      .order('published_at', { ascending: false }).order('id', { ascending: false }).limit(limit),
    'news',
  );
}

async function getNewsBySlugUncached(slug: string): Promise<News | null> {
  if (off()) return null;
  const { data, error } = await createPublicClient().from('news').select('*').eq('slug', slug).maybeSingle();
  if (error) throw new Error(`Could not load the story: ${error.message}`);
  return data;
}

const RANK = { ongoing: 0, upcoming: 1, completed: 2 } as const;

/**
 * Campaigns double as events. Each row gets a computed `status`.
 * Order: ongoing & upcoming first (soonest first), then completed (most recent first).
 */
const campaignRows = cached(async () => must(await createPublicClient().from('campaigns').select('*'), 'campaigns'), 'campaigns', 'campaigns');

export async function getCampaigns(): Promise<Campaign[]> {
  if (off()) return [];
  const today = todayISO();
  const rows = await campaignRows();
  return rows
    .map((c) => ({ ...c, status: campaignStatus(c, today) }))
    .sort((a, b) =>
      RANK[a.status] - RANK[b.status] ||
      (a.status === 'completed' ? b.start_date.localeCompare(a.start_date) : a.start_date.localeCompare(b.start_date)));
}

export async function getUpcomingCampaigns(limit = 12): Promise<Campaign[]> {
  return (await getCampaigns()).filter((c) => c.status !== 'completed').slice(0, limit);
}

export async function getCampaignBySlug(slug: string): Promise<Campaign | null> {
  if (off()) return null;
  const data = (await campaignRows()).find((c) => c.slug === slug);
  return data ? { ...data, status: campaignStatus(data) } : null;
}

async function getWardsUncached(): Promise<string[]> {
  if (off()) return [];
  const rows = must(await createPublicClient().from('wards').select('name').order('sort').order('name'), 'wards');
  return rows.map((w) => w.name);
}

/** Public ID-card verification (QR code). Uses a security-definer RPC that returns only card fields. */
export async function getMemberByNo(no: string): Promise<VerifiedMember | null> {
  if (off()) return null;
  const { data, error } = await createPublicClient().rpc('verify_member', { p_member_no: no });
  if (error) throw new Error(`Could not verify the member: ${error.message}`);
  return data?.[0] ?? null;
}

export const getSlides = cached(getSlidesUncached, 'slides', 'slides');

export const getGallery = cached(getGalleryUncached, 'gallery', 'gallery');

export const getLeaders = cached(getLeadersUncached, 'leaders', 'leaders');

export const getFounders = cached(getFoundersUncached, 'founders', 'leaders');

export const getPartners = cached(getPartnersUncached, 'partners', 'partners');

export const getInstagram = cached(getInstagramUncached, 'instagram', 'instagram');

export const getNews = cached(getNewsUncached, 'news', 'news');

export const getNewsBySlug = cached(getNewsBySlugUncached, 'news-slug', 'news');

export const getWards = cached(getWardsUncached, 'wards', 'wards');
