import bcrypt from 'bcryptjs';
import type { MembershipPayload } from '@/lib/types';
import { ok, fail, body, str, publicRoute } from '@/lib/http';
import { createOrder, paymentMode, publicKey } from '@/lib/payments';
import { createServiceClient } from '@/lib/supabase/admin';
import { publicBucketUrl, BUCKETS } from '@/lib/supabase/env';
import { getMembershipFee } from '@/lib/queries';
import { PHONE_RE, PIN_RE, EMAIL_RE } from '@/lib/utils';


// Step 1 of sign-up: validate the form and open a Razorpay order. Nothing is registered until payment is verified.
export const POST = publicRoute(async (req) => {
  const b = await body(req);
  const name = str(b.name).trim().slice(0, 120);
  const email = str(b.email).trim().toLowerCase();
  const phone = str(b.phone).replace(/\D/g, '').slice(-10);
  const ward = str(b.ward).trim();
  const pincode = str(b.pincode).trim();
  const password = str(b.password);
  const photoIn = str(b.photo);
  const photo = photoIn.startsWith(publicBucketUrl(BUCKETS.members)) ? photoIn : null;

  if (name.length < 2) return fail('Please enter your full name');
  if (!PHONE_RE.test(phone)) return fail('Please enter a valid 10-digit mobile number');
  if (email && !EMAIL_RE.test(email)) return fail('Please enter a valid email address');
  if (password.length < 6) return fail('Password must be at least 6 characters');
  if (password !== str(b.confirm)) return fail('Passwords do not match');
  if (!PIN_RE.test(pincode)) return fail('Please enter a valid 6-digit pincode');
  if (b.agree !== true) return fail('Please accept the terms and conditions to continue');

  const db = createServiceClient();
  const [{ data: wardRow }, { data: existing }] = await Promise.all([
    db.from('wards').select('id').eq('name', ward).maybeSingle(),
    db.from('members').select('id').eq('phone', phone).maybeSingle(),
  ]);
  if (!wardRow) return fail('Please select your ward');
  if (existing) return fail('This mobile number is already registered. Please log in.', 409);

  const fee = await getMembershipFee();
  const order = await createOrder(fee, `mem_${Date.now()}`, { purpose: 'membership', phone });
  const payload: MembershipPayload = {
    name, email: email || null, phone, ward, pincode, photo, password_hash: bcrypt.hashSync(password, 10),
  };
  const { error } = await db.from('pending_orders').insert({ order_id: order.id, kind: 'membership', payload, amount: fee });
  if (error) throw new Error(error.message);

  return ok({
    mode: paymentMode(), key: publicKey(), order_id: order.id, amount: order.amount, currency: 'INR',
    prefill: { name, email, contact: phone }, description: 'Membership fee',
  });
});
