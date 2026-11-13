import type { DonationPayload } from '@/lib/types';
import { ok, fail, body, str, publicRoute } from '@/lib/http';
import { createOrder, paymentMode, publicKey } from '@/lib/payments';
import { createServiceClient } from '@/lib/supabase/admin';
import { PHONE_RE, EMAIL_RE, PAN_RE } from '@/lib/utils';


export const POST = publicRoute(async (req) => {
  const b = await body(req);
  const name = str(b.name).trim().slice(0, 120);
  const email = str(b.email).trim().toLowerCase();
  const phone = str(b.phone).replace(/\D/g, '').slice(-10);
  const amount = Math.floor(Number(b.amount));
  const pan = str(b.pan).trim().toUpperCase();
  const campaign_id = b.campaign_id ? Number(b.campaign_id) : null;

  if (name.length < 2) return fail('Please enter your name');
  if (!PHONE_RE.test(phone)) return fail('Please enter a valid 10-digit mobile number');
  if (email && !EMAIL_RE.test(email)) return fail('Please enter a valid email address');
  if (!Number.isFinite(amount) || amount < 10) return fail('Minimum donation is ₹10');
  if (amount > 1000000) return fail('For donations above ₹10 lakh please contact us directly');
  if (pan && !PAN_RE.test(pan)) return fail('Please enter a valid PAN or leave it empty');

  const db = createServiceClient();
  if (campaign_id) {
    const { data } = await db.from('campaigns').select('id').eq('id', campaign_id).maybeSingle();
    if (!data) return fail('Campaign not found');
  }

  const order = await createOrder(amount, `don_${Date.now()}`, { purpose: 'donation', phone });
  const payload: DonationPayload = {
    name, email: email || null, phone, pan: pan || null, amount, campaign_id,
    message: str(b.message).slice(0, 500), anonymous: Boolean(b.anonymous),
  };
  const { error } = await db.from('pending_orders').insert({ order_id: order.id, kind: 'donation', payload, amount });
  if (error) throw new Error(error.message);

  return ok({
    mode: paymentMode(), key: publicKey(), order_id: order.id, amount: order.amount, currency: 'INR',
    prefill: { name, email, contact: phone }, description: 'Donation',
  });
});
