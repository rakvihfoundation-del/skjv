// Small helpers safe to use on both server and client.
import type { CampaignRow, CampaignStatus, Lang } from './types';

export function slugify(s = ''): string {
  const base = String(s)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return base || Math.random().toString(36).slice(2, 10);
}

export const inr = (n: number | string | null | undefined): string =>
  '₹' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });

export function compact(n: number | string | null | undefined): string {
  const v = Number(n || 0);
  if (v >= 100000) return (v / 100000).toFixed(v % 100000 === 0 ? 0 : 1) + 'L';
  if (v >= 1000) return (v / 1000).toFixed(v % 1000 === 0 ? 0 : 1) + 'K';
  return String(v);
}

const KN_MONTHS = ['ಜನವರಿ', 'ಫೆಬ್ರವರಿ', 'ಮಾರ್ಚ್', 'ಏಪ್ರಿಲ್', 'ಮೇ', 'ಜೂನ್', 'ಜುಲೈ', 'ಆಗಸ್ಟ್', 'ಸೆಪ್ಟೆಂಬರ್', 'ಅಕ್ಟೋಬರ್', 'ನವೆಂಬರ್', 'ಡಿಸೆಂಬರ್'];
const EN_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Parses `YYYY-MM-DD`, `YYYY-MM-DD HH:MM:SS` or an ISO timestamp. */
export function parseDate(d: string | Date | null | undefined): Date | null {
  if (!d) return null;
  if (d instanceof Date) return isNaN(d.getTime()) ? null : d;
  const s = d.length === 10 ? d + 'T00:00:00' : d.replace(' ', 'T');
  const x = new Date(s);
  return isNaN(x.getTime()) ? null : x;
}

export function fmtDate(d: string | Date | null | undefined, lang: Lang = 'en', opts: { short?: boolean } = {}): string {
  const x = parseDate(d);
  if (!x) return '';
  const m = lang === 'kn' ? KN_MONTHS[x.getMonth()] : EN_MONTHS[x.getMonth()];
  if (opts.short) return `${x.getDate()} ${m}`;
  return `${x.getDate()} ${m} ${x.getFullYear()}`;
}

export function monthShort(d: string | null | undefined, lang: Lang = 'en'): string {
  const x = parseDate(d);
  if (!x) return '';
  return lang === 'kn' ? KN_MONTHS[x.getMonth()] : EN_MONTHS[x.getMonth()].toUpperCase();
}

export function initials(name: string | null | undefined = ''): string {
  return String(name || '').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

export const PHONE_RE = /^[6-9]\d{9}$/;
export const PIN_RE = /^[1-9]\d{5}$/;
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const PAN_RE = /^[A-Z]{5}\d{4}[A-Z]$/;

/** Today's date (local) as YYYY-MM-DD. */
export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Campaign status is worked out from its dates — nobody has to update it by hand. */
export function campaignStatus(c: Pick<CampaignRow, 'start_date' | 'end_date'> | null | undefined, today = todayISO()): CampaignStatus {
  const start = c?.start_date;
  const end = c?.end_date || start;
  if (!start || !end) return 'ongoing';
  if (start > today) return 'upcoming';
  if (end >= today) return 'ongoing';
  return 'completed';
}

/** Ward names in the active language ("Ward 05" → "ವಾರ್ಡ್ 05"). */
export function wardLabel(w: string | null | undefined = '', lang: Lang = 'en'): string {
  const s = String(w || '');
  return lang === 'kn' ? s.replace(/^ward\s*/i, 'ವಾರ್ಡ್ ') : s;
}

const PLACES_KN: Record<string, string> = {
  Karnataka: 'ಕರ್ನಾಟಕ', Bengaluru: 'ಬೆಂಗಳೂರು', 'Bengaluru Urban': 'ಬೆಂಗಳೂರು ನಗರ', 'Bengaluru Rural': 'ಬೆಂಗಳೂರು ಗ್ರಾಮಾಂತರ',
  Mysuru: 'ಮೈಸೂರು', Mandya: 'ಮಂಡ್ಯ', Hassan: 'ಹಾಸನ', Kodagu: 'ಕೊಡಗು', Chamarajanagar: 'ಚಾಮರಾಜನಗರ', Ramanagara: 'ರಾಮನಗರ',
  Tumakuru: 'ತುಮಕೂರು', Kolar: 'ಕೋಲಾರ', Chikkaballapur: 'ಚಿಕ್ಕಬಳ್ಳಾಪುರ', Chitradurga: 'ಚಿತ್ರದುರ್ಗ', Davanagere: 'ದಾವಣಗೆರೆ',
  Shivamogga: 'ಶಿವಮೊಗ್ಗ', Chikkamagaluru: 'ಚಿಕ್ಕಮಗಳೂರು', Udupi: 'ಉಡುಪಿ', 'Dakshina Kannada': 'ದಕ್ಷಿಣ ಕನ್ನಡ', Mangaluru: 'ಮಂಗಳೂರು',
  'Uttara Kannada': 'ಉತ್ತರ ಕನ್ನಡ', Belagavi: 'ಬೆಳಗಾವಿ', Dharwad: 'ಧಾರವಾಡ', Hubballi: 'ಹುಬ್ಬಳ್ಳಿ', Gadag: 'ಗದಗ', Haveri: 'ಹಾವೇರಿ',
  Bagalkot: 'ಬಾಗಲಕೋಟೆ', Vijayapura: 'ವಿಜಯಪುರ', Kalaburagi: 'ಕಲಬುರಗಿ', Bidar: 'ಬೀದರ್', Yadgir: 'ಯಾದಗಿರಿ', Raichur: 'ರಾಯಚೂರು',
  Koppal: 'ಕೊಪ್ಪಳ', Ballari: 'ಬಳ್ಳಾರಿ', Vijayanagara: 'ವಿಜಯನಗರ', Channapatna: 'ಚನ್ನಪಟ್ಟಣ', Hosakote: 'ಹೊಸಕೋಟೆ',
};

/** District / town names in the active language. */
export function placeLabel(name: string | null | undefined = '', lang: Lang = 'en'): string {
  const s = String(name || '');
  return lang === 'kn' ? PLACES_KN[s.trim()] || s : s;
}

/** Extra photos: accepts an array, a JSON array string or a newline list. */
export function parseList(v: unknown): string[] {
  if (!v) return [];
  if (Array.isArray(v)) return v.map(String);
  try {
    const a: unknown = JSON.parse(String(v));
    return Array.isArray(a) ? a.map(String) : [];
  } catch {
    return String(v).split(/\n+/).filter(Boolean);
  }
}

/** Cover photo first, then the extra photos (no duplicates). */
export function photosOf(row: { image?: string | null; images?: string[] | null } | null | undefined): string[] {
  return [...new Set([row?.image, ...parseList(row?.images)].filter((x): x is string => Boolean(x)))];
}

export type VideoSource = { kind: 'embed'; src: string; thumb?: string } | { kind: 'file'; src: string; thumb?: undefined };

/** YouTube / Vimeo links become embeds; anything else is played as a file. */
export function videoEmbed(url: string | null | undefined): VideoSource | null {
  if (!url) return null;
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/);
  if (yt) return { kind: 'embed', src: `https://www.youtube-nocookie.com/embed/${yt[1]}?autoplay=1&rel=0`, thumb: `https://i.ytimg.com/vi/${yt[1]}/hqdefault.jpg` };
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) return { kind: 'embed', src: `https://player.vimeo.com/video/${vm[1]}?autoplay=1` };
  return { kind: 'file', src: url };
}

/** Removes characters that would break a PostgREST `or()` / `ilike` filter. */
export function searchTerm(q: string | null | undefined): string {
  return String(q || '').replace(/[,()%*\\:"']/g, ' ').trim().slice(0, 80);
}
