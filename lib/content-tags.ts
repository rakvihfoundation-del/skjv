// Cache tags for public website content (one per table). Kept in its own file with no imports so that
// both lib/queries.ts and lib/revalidate.ts can load it in any order.
export const CONTENT_TAGS = ['settings', 'slides', 'gallery', 'leaders', 'partners', 'instagram', 'news', 'campaigns', 'wards'] as const;
export type ContentTag = (typeof CONTENT_TAGS)[number];

export const isContentTag = (table: string): table is ContentTag => (CONTENT_TAGS as readonly string[]).includes(table);
