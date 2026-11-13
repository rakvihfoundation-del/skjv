// File rules for Supabase Storage uploads (shared by the server and the admin browser uploader).
import { BUCKETS } from './supabase/env';

export const IMAGE_TYPES: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' };
export const VIDEO_TYPES: Record<string, string> = { 'video/mp4': 'mp4', 'video/webm': 'webm', 'video/quicktime': 'mov' };

export const LIMITS = { imageMB: 10, videoMB: 100, memberPhotoMB: 4 } as const;

export type UploadKind = 'image' | 'video';

/** Validates a file and returns its extension, or throws a friendly error. */
export function checkFile(file: { type: string; size: number }, kind: UploadKind, maxMB: number): string {
  const ext = (kind === 'video' ? VIDEO_TYPES : IMAGE_TYPES)[file.type];
  if (!ext) throw new Error(kind === 'video' ? 'Please upload an MP4, WEBM or MOV video' : 'Please upload a JPG, PNG or WEBP image');
  if (file.size > maxMB * 1024 * 1024) throw new Error(`${kind === 'video' ? 'Video' : 'Image'} must be smaller than ${maxMB} MB`);
  return ext;
}

/** A unique object path like `news/2026/11/mx3k2-9f8a7b.jpg`. */
export function objectPath(folder: string, ext: string): string {
  const d = new Date();
  const rand = Array.from(crypto.getRandomValues(new Uint8Array(5)), (b) => b.toString(16).padStart(2, '0')).join('');
  return `${folder}/${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${Date.now().toString(36)}-${rand}.${ext}`;
}

export { BUCKETS };
