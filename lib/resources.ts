// Content types managed from the admin panel.
// Shared by the API (validation / allowed columns) and the admin UI (forms / tables).
import type { TableName } from './supabase/database.types';

export type FieldType = 'text' | 'textarea' | 'longtext' | 'number' | 'date' | 'select' | 'bool' | 'image' | 'images' | 'video';

export type Field = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  default?: string | number | boolean;
  options?: readonly string[];
  placeholder?: string;
};

/** Sort order: [column, ascending]. Applied in the database. */
export type OrderSpec = readonly (readonly [string, boolean])[];

export type ResourceConfig = {
  table: Extract<TableName, 'slides' | 'news' | 'campaigns' | 'gallery' | 'leaders' | 'partners' | 'instagram' | 'wards'>;
  label: string;
  singular: string;
  icon: string;
  order: OrderSpec;
  /** Optional extra in-memory ordering (e.g. leaders by level). */
  rank?: { column: string; values: readonly string[] };
  slugFrom?: string;
  hint?: string;
  requireOneOf?: readonly string[];
  fields: Field[];
  columns: string[];
};

export type ResourceName = 'slides' | 'news' | 'campaigns' | 'gallery' | 'leaders' | 'partners' | 'instagram' | 'wards';

// English is required where marked; Kannada is optional (the site falls back to English).
const bi = (name: string, label: string, type: FieldType = 'text', extra: Partial<Field> = {}): Field[] => [
  { name: `${name}_en`, label: `${label} (English)`, type, ...extra },
  { name: `${name}_kn`, label: `${label} (ಕನ್ನಡ)`, type, ...extra, required: false },
];

export const NEWS_CATEGORIES = ['Announcement', 'Protest', 'Culture', 'Service', 'Press'] as const;
export const GALLERY_ALBUMS = ['Events', 'Protests', 'Culture', 'Service', 'Heritage'] as const;
export const LEADER_TIERS = ['founder', 'state', 'district', 'taluk'] as const;

export const RESOURCES: Record<ResourceName, ResourceConfig> = {
  slides: {
    table: 'slides',
    label: 'Hero Banners',
    singular: 'Banner',
    icon: 'Images',
    order: [['sort', true], ['id', true]],
    hint: 'Wide banners (3:1 ratio, e.g. 2172×724) shown in the home page slider.',
    fields: [
      { name: 'image', label: 'Banner image', type: 'image', required: true },
      { name: 'title', label: 'Alt text / title', type: 'text' },
      { name: 'link', label: 'Link (optional)', type: 'text', placeholder: '/campaigns' },
      { name: 'sort', label: 'Order', type: 'number', default: 0 },
      { name: 'active', label: 'Show on site', type: 'bool', default: true },
    ],
    columns: ['image', 'title', 'sort', 'active'],
  },
  news: {
    table: 'news',
    label: 'News',
    singular: 'Article',
    icon: 'Newspaper',
    order: [['published_at', false], ['id', false]],
    slugFrom: 'title_en',
    fields: [
      ...bi('title', 'Headline', 'text', { required: true }),
      { name: 'category', label: 'Category', type: 'select', options: NEWS_CATEGORIES, default: 'Announcement' },
      { name: 'published_at', label: 'Publish date', type: 'date', required: true },
      ...bi('excerpt', 'Short summary', 'textarea'),
      ...bi('body', 'Full story', 'longtext'),
      { name: 'image', label: 'Cover image', type: 'image' },
      { name: 'images', label: 'More photos (shown as a slider on the story page)', type: 'images' },
      { name: 'featured', label: 'Featured story', type: 'bool', default: false },
    ],
    columns: ['image', 'title_en', 'category', 'published_at', 'featured'],
  },
  campaigns: {
    table: 'campaigns',
    label: 'Campaigns & Events',
    singular: 'Campaign',
    icon: 'Megaphone',
    order: [['start_date', false], ['id', false]],
    slugFrom: 'title_en',
    hint: 'Programmes and events. Upcoming ones show in “Upcoming events” on the home page. Status (upcoming / ongoing / completed) is set automatically from the dates.',
    fields: [
      ...bi('title', 'Title', 'text', { required: true }),
      { name: 'start_date', label: 'Date (or start date)', type: 'date', required: true },
      { name: 'end_date', label: 'End date (only for multi-day campaigns)', type: 'date' },
      { name: 'time', label: 'Time', type: 'text', placeholder: '10:00 AM' },
      ...bi('venue', 'Venue'),
      ...bi('summary', 'Short summary', 'textarea'),
      ...bi('body', 'Full details', 'longtext'),
      { name: 'image', label: 'Cover image', type: 'image' },
      { name: 'images', label: 'More photos (shown as a slider on the campaign page)', type: 'images' },
    ],
    columns: ['image', 'title_en', 'start_date', 'status', 'venue_en'],
  },
  gallery: {
    table: 'gallery',
    label: 'Gallery',
    singular: 'Gallery item',
    icon: 'GalleryHorizontalEnd',
    order: [['sort', true], ['id', false]],
    hint: 'Each item is one gallery post: a cover photo, optional extra photos (they slide automatically) and an optional video.',
    requireOneOf: ['image', 'video'],
    fields: [
      { name: 'image', label: 'Cover photo (also the video thumbnail)', type: 'image' },
      { name: 'images', label: 'More photos (optional)', type: 'images' },
      { name: 'video', label: 'Video (optional)', type: 'video' },
      ...bi('title', 'Caption'),
      { name: 'album', label: 'Album', type: 'select', options: GALLERY_ALBUMS, default: 'Events' },
      { name: 'sort', label: 'Order', type: 'number', default: 0 },
    ],
    columns: ['image', 'title_en', 'images', 'video', 'album'],
  },
  leaders: {
    table: 'leaders',
    label: 'Leaders',
    singular: 'Leader',
    icon: 'Users',
    order: [['sort', true], ['id', true]],
    rank: { column: 'tier', values: LEADER_TIERS },
    fields: [
      ...bi('name', 'Name', 'text', { required: true }),
      ...bi('role', 'Designation', 'text', { required: true }),
      { name: 'tier', label: 'Level', type: 'select', options: LEADER_TIERS, default: 'state' },
      { name: 'district', label: 'District / Region', type: 'text' },
      { name: 'photo', label: 'Photo', type: 'image' },
      ...bi('bio', 'Short bio', 'textarea'),
      ...bi('quote', 'Quote', 'textarea'),
      { name: 'sort', label: 'Order', type: 'number', default: 0 },
    ],
    columns: ['photo', 'name_en', 'role_en', 'tier', 'district'],
  },
  partners: {
    table: 'partners',
    label: 'Partners',
    singular: 'Partner',
    icon: 'Handshake',
    order: [['sort', true], ['id', true]],
    fields: [
      { name: 'name', label: 'Organisation name', type: 'text', required: true },
      { name: 'logo', label: 'Logo (optional)', type: 'image' },
      { name: 'url', label: 'Website', type: 'text' },
      { name: 'sort', label: 'Order', type: 'number', default: 0 },
    ],
    columns: ['logo', 'name', 'url', 'sort'],
  },
  instagram: {
    table: 'instagram',
    label: 'Instagram Posts',
    singular: 'Post',
    icon: 'Camera',
    order: [['sort', true], ['id', false]],
    hint: 'Posts shown in the Instagram section on the home page. Paste the post link so visitors can open it.',
    fields: [
      { name: 'image', label: 'Post image', type: 'image', required: true },
      { name: 'caption', label: 'Caption', type: 'textarea' },
      { name: 'url', label: 'Instagram post URL', type: 'text' },
      { name: 'likes', label: 'Likes (display)', type: 'number', default: 0 },
      { name: 'sort', label: 'Order', type: 'number', default: 0 },
    ],
    columns: ['image', 'caption', 'likes', 'sort'],
  },
  wards: {
    table: 'wards',
    label: 'Wards',
    singular: 'Ward',
    icon: 'MapPinned',
    order: [['sort', true], ['name', true]],
    hint: 'Wards members can choose during sign-up.',
    fields: [
      { name: 'name', label: 'Ward name', type: 'text', required: true },
      { name: 'sort', label: 'Order', type: 'number', default: 0 },
    ],
    columns: ['name', 'sort'],
  },
};

/** A settings field; `span` is how many of the 4 grid columns it takes (default 2). */
export type SettingsField = Field & { span?: 1 | 2 | 4; hint?: string };
export type SettingsGroup = { group: string; desc: string; icon: 'membership' | 'contact' | 'social' | 'numbers' | 'trust'; fields: SettingsField[] };

export const SETTINGS_FIELDS: SettingsGroup[] = [
  { group: 'Membership', icon: 'membership', desc: 'The sign-up fee and what is printed on every member ID card.', fields: [
    { name: 'membership_fee', label: 'Membership fee (₹)', type: 'number', hint: 'Charged once when someone signs up.' },
    { name: 'card_validity', label: 'Card validity', type: 'text', placeholder: 'Lifetime', hint: 'Shown on the ID card, e.g. “Lifetime”.' },
    { name: 'president_name', label: 'Signatory on ID card (English)', type: 'text' },
    { name: 'president_name_kn', label: 'Signatory on ID card (ಕನ್ನಡ)', type: 'text' },
  ] },
  { group: 'Contact details', icon: 'contact', desc: 'Shown in the footer, on the About page and on the back of the ID card.', fields: [
    { name: 'phone', label: 'Phone', type: 'text', placeholder: '+91 98450 00000' },
    { name: 'email', label: 'Email', type: 'text', placeholder: 'info@example.org' },
    { name: 'whatsapp', label: 'WhatsApp number', type: 'text', placeholder: '919845000000', hint: 'With country code, digits only (no + or spaces).', span: 4 },
    { name: 'address_en', label: 'Office address (English)', type: 'textarea' },
    { name: 'address_kn', label: 'Office address (ಕನ್ನಡ)', type: 'textarea' },
    { name: 'map_embed', label: 'Google Maps embed link (optional)', type: 'text', placeholder: 'https://www.google.com/maps/embed?pb=…', hint: 'Google Maps → Share → Embed a map → copy the link inside src="…".', span: 4 },
  ] },
  { group: 'Social media', icon: 'social', desc: 'Links for the social icons in the header and footer. Leave a box empty to hide that icon.', fields: [
    { name: 'instagram_handle', label: 'Instagram handle', type: 'text', placeholder: 'skjv_official', hint: 'Without the @.' },
    { name: 'instagram_url', label: 'Instagram link', type: 'text', placeholder: 'https://instagram.com/…' },
    { name: 'facebook_url', label: 'Facebook link', type: 'text', placeholder: 'https://facebook.com/…' },
    { name: 'youtube_url', label: 'YouTube link', type: 'text', placeholder: 'https://youtube.com/@…' },
    { name: 'x_url', label: 'X / Twitter link', type: 'text', placeholder: 'https://x.com/…' },
  ] },
  { group: 'Ammana Neralu Foundation', icon: 'trust', desc: 'The old age home section on the home page. Leave phone or address empty to hide them.', fields: [
    { name: 'trust_name_en', label: 'Name (English)', type: 'text' },
    { name: 'trust_name_kn', label: 'Name (ಕನ್ನಡ)', type: 'text' },
    { name: 'trust_tagline_en', label: 'Short line (English)', type: 'text', placeholder: 'Old age home' },
    { name: 'trust_tagline_kn', label: 'Short line (ಕನ್ನಡ)', type: 'text', placeholder: 'ವೃದ್ಧಾಶ್ರಮ' },
    { name: 'trust_about_en', label: 'About the home (English)', type: 'textarea' },
    { name: 'trust_about_kn', label: 'About the home (ಕನ್ನಡ)', type: 'textarea' },
    { name: 'trust_image', label: 'Photo', type: 'image', span: 4, hint: 'A tall (portrait) photo works best.' },
    { name: 'trust_phone', label: 'Phone (optional)', type: 'text', placeholder: '+91 98450 00000' },
    { name: 'trust_address', label: 'Address (optional)', type: 'text' },
  ] },
  { group: 'Home page numbers', icon: 'numbers', desc: 'The counters in the “One voice for every Kannadiga” section of the home page.', fields: [
    { name: 'stat_members', label: 'Members', type: 'number', span: 1 },
    { name: 'stat_districts', label: 'Districts', type: 'number', span: 1 },
    { name: 'stat_campaigns', label: 'Campaigns', type: 'number', span: 1 },
    { name: 'stat_volunteers', label: 'Volunteers', type: 'number', span: 1 },
  ] },
];

export const SETTINGS_KEYS: string[] = SETTINGS_FIELDS.flatMap((g) => g.fields.map((f) => f.name));

export const isResourceName = (n: string): n is ResourceName => Object.prototype.hasOwnProperty.call(RESOURCES, n);
