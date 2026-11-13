import { ok, fail, publicRoute } from '@/lib/http';
import { createServiceClient } from '@/lib/supabase/admin';
import { BUCKETS } from '@/lib/supabase/env';
import { objectPath } from '@/lib/storage';
import { checkProof } from '@/lib/proofs';

// Volunteer sign-up, step 1: upload the ID proof to the PRIVATE bucket. Returns a reference (not a URL);
// nobody can open the file except admins. Files that are never used for a sign-up stay under "pending/".
export const POST = publicRoute(async (req) => {
  const form = await req.formData();
  const file = form.get('file');
  if (!(file instanceof File)) return fail('No file received');
  let ext: string;
  try {
    ext = checkProof(file);
  } catch (e) {
    return fail((e as Error).message);
  }
  const path = objectPath('pending', ext);
  const { error } = await createServiceClient().storage.from(BUCKETS.proofs)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw new Error(error.message);
  return ok({ ref: path, name: file.name, type: file.type });
});
