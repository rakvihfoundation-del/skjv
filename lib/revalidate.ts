import 'server-only';
import { revalidateTag } from 'next/cache';
import { isContentTag } from './content-tags';

/** Clears cached website content after the admin panel changes it, so the site shows it immediately. */
export function refreshContent(table: string): void {
  if (isContentTag(table)) revalidateTag(table, { expire: 0 });
}
