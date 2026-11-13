import { ok, fail, adminRoute } from '@/lib/http';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/admin';
import { BUCKETS } from '@/lib/supabase/env';

type Params = { id: string };

// A short-lived (2 minute) private link to the volunteer's ID proof. Admins only.
export const GET = adminRoute<Params>(async (_req, { params }) => {
  const id = Number((await params).id);
  const supabase = await createClient(); // RLS: only admins can read any volunteer row
  const { data } = await supabase.from('volunteers').select('proof_path, proof_type').eq('id', id).maybeSingle();
  if (!data?.proof_path) return fail('ID proof not found', 404);
  const { data: link, error } = await createServiceClient().storage.from(BUCKETS.proofs).createSignedUrl(data.proof_path, 120);
  if (error || !link) return fail('Could not open the ID proof', 500);
  return ok({ url: link.signedUrl, type: data.proof_type, pdf: data.proof_path.toLowerCase().endsWith('.pdf') });
});
