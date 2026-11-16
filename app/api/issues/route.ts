import { ok, fail, publicRoute } from '@/lib/http';
import { createServiceClient } from '@/lib/supabase/admin';
import { getUser, getParticipant } from '@/lib/auth';
import { BUCKETS } from '@/lib/supabase/env';
import { checkFile, objectPath, LIMITS } from '@/lib/storage';
import { SAMPLE_ISSUES } from '@/lib/sample-issues';

const MAX_IMAGES = 10;

/** Submit a new issue (open to the public: anonymous visitors, members, and volunteers). */
export const POST = publicRoute(async (req) => {
  const form = await req.formData();
  const rawName = (form.get('author_name') || form.get('name') || '') as string;
  const rawPhone = (form.get('author_phone') || form.get('phone') || '') as string;
  const description = ((form.get('description') as string) || '').trim();
  const city = ((form.get('city') as string) || '').trim();
  const needs = ((form.get('needs') as string) || '').trim();

  // If user happens to be logged in, we associate their account
  const user = await getUser().catch(() => null);
  const participant = await getParticipant().catch(() => null);

  const author_name = rawName.trim() || participant?.name || '';
  const author_phone = rawPhone.trim() || (participant?.kind === 'member' ? (participant as { phone?: string }).phone : null) || null;

  if (!author_name) return fail('Please enter your name');
  if (author_name.length > 150) return fail('Name is too long');
  if (!city) return fail('Please enter your city, village or town');
  if (city.length > 200) return fail('City / town name is too long');
  if (!description) return fail('Please describe the issue');
  if (description.length > 2000) return fail('Description must be under 2000 characters');

  const db = createServiceClient();

  // Upload images (up to 10, max 1 MB each)
  const imageUrls: string[] = [];
  for (let i = 0; i < MAX_IMAGES; i++) {
    const file = form.get(`image_${i}`);
    if (!(file instanceof File) || file.size === 0) continue;
    let ext: string;
    try {
      ext = checkFile(file, 'image', LIMITS.issueImageMB);
    } catch (e) {
      return fail(`Image ${i + 1}: ${(e as Error).message}`);
    }
    const path = objectPath('issues', ext);
    const { error } = await db.storage.from(BUCKETS.media).upload(path, file, {
      contentType: file.type, upsert: false, cacheControl: '31536000',
    });
    if (error) {
      console.error('Storage upload error:', error);
      throw new Error(error.message);
    }
    imageUrls.push(db.storage.from(BUCKETS.media).getPublicUrl(path).data.publicUrl);
  }

  // Upload video (optional, max 1, max 30 MB)
  let videoUrl: string | null = null;
  const videoFile = form.get('video');
  if (videoFile instanceof File && videoFile.size > 0) {
    let ext: string;
    try {
      ext = checkFile(videoFile, 'video', LIMITS.issueVideoMB);
    } catch (e) {
      return fail((e as Error).message);
    }
    const path = objectPath('issues', ext);
    const { error } = await db.storage.from(BUCKETS.media).upload(path, videoFile, {
      contentType: videoFile.type, upsert: false, cacheControl: '31536000',
    });
    if (error) {
      console.error('Video upload error:', error);
      throw new Error(error.message);
    }
    videoUrl = db.storage.from(BUCKETS.media).getPublicUrl(path).data.publicUrl;
  }

  // Upload PDF (optional, all-in-one document, max 15 MB)
  let pdfUrl: string | null = null;
  const pdfFile = form.get('pdf');
  if (pdfFile instanceof File && pdfFile.size > 0) {
    let ext: string;
    try {
      ext = checkFile(pdfFile, 'pdf', LIMITS.issuePdfMB);
    } catch (e) {
      return fail((e as Error).message);
    }
    const path = objectPath('issues', ext);
    const { error } = await db.storage.from(BUCKETS.media).upload(path, pdfFile, {
      contentType: pdfFile.type || 'application/pdf', upsert: false, cacheControl: '31536000',
    });
    if (error) {
      console.error('PDF upload error:', error);
      throw new Error(error.message);
    }
    pdfUrl = db.storage.from(BUCKETS.media).getPublicUrl(path).data.publicUrl;
  }

  const row: Record<string, unknown> = {
    user_id: user?.id ?? null,
    author_name,
    author_phone: author_phone || null,
    description,
    city,
    needs: needs || null,
    images: imageUrls,
    video: videoUrl,
    pdf: pdfUrl,
    status: 'open',
  };

  if (participant?.kind === 'member') row.member_id = participant.id;
  if (participant?.kind === 'volunteer') row.volunteer_id = participant.id;

  const { data, error } = await db.from('issues').insert(row as any).select('id').single();
  if (error) {
    console.error('DB insert error:', error);
    throw new Error(error.message);
  }

  return ok({ ok: true, id: data.id });
});

/** Get all issues (public). Returns real rows or fallback sample data if empty. */
export const GET = publicRoute(async (req) => {
  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get('limit')) || 50, 200);
  const offset = Number(url.searchParams.get('offset')) || 0;

  try {
    const db = createServiceClient();
    const { data, error, count } = await db
      .from('issues')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error || !data || data.length === 0) {
      return ok({ items: SAMPLE_ISSUES, total: SAMPLE_ISSUES.length });
    }

    return ok({ items: data, total: count ?? data.length });
  } catch (e) {
    console.error('GET issues error, using sample data:', e);
    return ok({ items: SAMPLE_ISSUES, total: SAMPLE_ISSUES.length });
  }
});
