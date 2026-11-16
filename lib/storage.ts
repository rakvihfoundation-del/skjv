// File rules for Supabase Storage uploads (shared by the server and the admin browser uploader).
import { BUCKETS } from './supabase/env';

export const IMAGE_TYPES: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' };
export const VIDEO_TYPES: Record<string, string> = { 'video/mp4': 'mp4', 'video/webm': 'webm', 'video/quicktime': 'mov' };
export const PDF_TYPES: Record<string, string> = { 'application/pdf': 'pdf' };

export const LIMITS = {
  imageMB: 10,
  videoMB: 100,
  memberPhotoMB: 4,
  issueImageMB: 1,   // 1 MB max per image for issues
  issueVideoMB: 30,  // 30 MB max for issue video
  issuePdfMB: 15,    // 15 MB max for all-in-one issue PDF
} as const;

export type UploadKind = 'image' | 'video' | 'pdf';

/** Validates a file and returns its extension, or throws a friendly error. */
export function checkFile(file: { type: string; size: number }, kind: UploadKind, maxMB: number): string {
  let ext: string | undefined;
  if (kind === 'video') ext = VIDEO_TYPES[file.type];
  else if (kind === 'pdf') ext = PDF_TYPES[file.type];
  else ext = IMAGE_TYPES[file.type];

  if (!ext) {
    if (kind === 'video') throw new Error('Please upload an MP4, WEBM or MOV video');
    if (kind === 'pdf') throw new Error('Please upload a PDF document (.pdf)');
    throw new Error('Please upload a JPG, PNG or WEBP image');
  }
  if (file.size > maxMB * 1024 * 1024) {
    const label = kind === 'video' ? 'Video' : kind === 'pdf' ? 'PDF document' : 'Image';
    throw new Error(`${label} must be smaller than ${maxMB} MB`);
  }
  return ext;
}

/** A unique object path like `news/2026/11/mx3k2-9f8a7b.jpg`. */
export function objectPath(folder: string, ext: string): string {
  const d = new Date();
  const rand = Array.from(crypto.getRandomValues(new Uint8Array(5)), (b) => b.toString(16).padStart(2, '0')).join('');
  return `${folder}/${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${Date.now().toString(36)}-${rand}.${ext}`;
}

export { BUCKETS };
