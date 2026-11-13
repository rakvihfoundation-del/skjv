import { ok, fail, body, str, publicRoute } from '@/lib/http';
import { createServiceClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { BUCKETS } from '@/lib/supabase/env';
import { VOLUNTEER_COLUMNS, volunteerAuthEmail } from '@/lib/auth';
import { PHONE_RE, PIN_RE, EMAIL_RE } from '@/lib/utils';
import { PROOF_TYPES, type ProofType } from '@/lib/types';

// Volunteer sign-up, step 2: free — no payment, no photo, no ID card. Needs one ID proof (uploaded in step 1).
// Creates the Supabase Auth login and the volunteer record, then signs the volunteer in.
export const POST = publicRoute(async (req) => {
  const b = await body(req);
  const name = str(b.name).trim().slice(0, 120);
  const email = str(b.email).trim().toLowerCase();
  const phone = str(b.phone).replace(/\D/g, '').slice(-10);
  const ward = str(b.ward).trim();
  const pincode = str(b.pincode).trim();
  const password = str(b.password);
  const proofType = str(b.proof_type) as ProofType;
  const proofRef = str(b.proof);

  if (name.length < 2) return fail('Please enter your full name');
  if (!PHONE_RE.test(phone)) return fail('Please enter a valid 10-digit mobile number');
  if (email && !EMAIL_RE.test(email)) return fail('Please enter a valid email address');
  if (!PIN_RE.test(pincode)) return fail('Please enter a valid 6-digit pincode');
  if (password.length < 6) return fail('Password must be at least 6 characters');
  if (password !== str(b.confirm)) return fail('Passwords do not match');
  if (!PROOF_TYPES.includes(proofType)) return fail('Please choose which ID proof you are uploading');
  if (!/^pending\/[\w/.-]+$/.test(proofRef) || proofRef.includes('..')) return fail('Please upload your ID proof');
  if (b.agree !== true) return fail('Please accept the volunteer declaration to continue');

  const db = createServiceClient();
  const folder = proofRef.slice(0, proofRef.lastIndexOf('/'));
  const fileName = proofRef.slice(proofRef.lastIndexOf('/') + 1);
  const [{ data: wardRow }, { data: existing }, { data: files }] = await Promise.all([
    db.from('wards').select('id').eq('name', ward).maybeSingle(),
    db.from('volunteers').select('id').eq('phone', phone).maybeSingle(),
    db.storage.from(BUCKETS.proofs).list(folder, { search: fileName, limit: 1 }),
  ]);
  if (!wardRow) return fail('Please select your ward');
  if (existing) return fail('This mobile number is already registered as a volunteer. Please log in.', 409);
  if (!files?.some((f) => f.name === fileName)) return fail('Your ID proof upload was not found. Please upload it again.');

  const authEmail = volunteerAuthEmail(phone);
  const { data: created, error: authError } = await db.auth.admin.createUser({
    email: authEmail, password, email_confirm: true,
    user_metadata: { role: 'volunteer', name, phone }, app_metadata: { role: 'volunteer' },
  });
  if (authError || !created.user) {
    const taken = /already|registered|exists/i.test(authError?.message || '');
    return fail(taken ? 'This mobile number is already registered as a volunteer. Please log in.' : 'Could not create your account. Please try again.', taken ? 409 : 500);
  }

  // Keep the proof under the volunteer's own folder.
  const finalPath = `volunteers/${created.user.id}/${fileName}`;
  const moved = await db.storage.from(BUCKETS.proofs).move(proofRef, finalPath);
  const proofPath = moved.error ? proofRef : finalPath;

  const { data: volunteer, error: insertError } = await db.from('volunteers').insert({
    user_id: created.user.id, auth_email: authEmail, name, email: email || null, phone, ward, pincode,
    proof_type: proofType, proof_path: proofPath,
  }).select(VOLUNTEER_COLUMNS).single();
  if (insertError || !volunteer) {
    await db.auth.admin.deleteUser(created.user.id);
    throw new Error(insertError?.message || 'Could not save your volunteer registration');
  }

  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({ email: authEmail, password });
  if (signInError) console.error('Volunteer auto sign-in failed', signInError.message);
  return ok({ volunteer });
});
