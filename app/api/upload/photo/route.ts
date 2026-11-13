import { ok, fail, publicRoute } from '@/lib/http';
import { createServiceClient } from '@/lib/supabase/admin';
import { BUCKETS } from '@/lib/supabase/env';
import { checkFile, objectPath, LIMITS } from '@/lib/storage';

// Public endpoint for the member photo during sign-up (validated here, stored with the service role).
export const POST = publicRoute(async (req) => {
  const form = await req.formData();
  const file = form.get('file');
  if (!(file instanceof File)) return fail('No file received');
  let ext: string;
  try {
    ext = checkFile(file, 'image', LIMITS.memberPhotoMB);
  } catch (e) {
    return fail((e as Error).message);
  }
  const db = createServiceClient();
  const path = objectPath('signup', ext);
  const { error } = await db.storage.from(BUCKETS.members).upload(path, file, { contentType: file.type, upsert: false, cacheControl: '31536000' });
  if (error) throw new Error(error.message);
  return ok({ url: db.storage.from(BUCKETS.members).getPublicUrl(path).data.publicUrl });
});
