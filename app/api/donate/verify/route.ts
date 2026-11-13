import { ok, fail, body, str, publicRoute } from '@/lib/http';
import { verifyPayment, paymentMode } from '@/lib/payments';
import { createServiceClient } from '@/lib/supabase/admin';
import type { DonationReceipt, DonationPayload } from '@/lib/types';

const RECEIPT_COLUMNS = 'receipt_no, name, amount, created_at, payment_id, pan, email, phone' as const;

export const POST = publicRoute(async (req) => {
  const b = await body(req);
  const order_id = str(b.order_id);
  const payment_id = str(b.payment_id);
  const signature = str(b.signature);
  const db = createServiceClient();

  const { data: pending } = await db.from('pending_orders').select('*')
    .eq('order_id', order_id).eq('kind', 'donation').maybeSingle();
  if (!pending) return fail('Order not found', 404);

  const receipt = async (id: number): Promise<DonationReceipt | null> =>
    (await db.from('donations').select(RECEIPT_COLUMNS).eq('id', id).single()).data;

  if (pending.status === 'paid' && pending.result_id) return ok({ receipt: await receipt(pending.result_id) });
  if (!verifyPayment({ order_id, payment_id, signature })) return fail('Payment could not be verified');

  const { data: claimed } = await db.from('pending_orders').update({ status: 'processing' })
    .eq('order_id', order_id).eq('status', 'created').select('order_id');
  if (!claimed?.length) return fail('Your payment is being processed. Please wait a moment and refresh.', 409);

  const p = pending.payload as unknown as DonationPayload;
  const { data: donation, error } = await db.from('donations').insert({
    name: p.name, email: p.email, phone: p.phone, pan: p.pan, amount: pending.amount, campaign_id: p.campaign_id,
    message: p.message || null, anonymous: p.anonymous, order_id, payment_id, payment_mode: paymentMode(),
  }).select('id').single();
  if (error || !donation) {
    await db.from('pending_orders').update({ status: 'created' }).eq('order_id', order_id);
    throw new Error(error?.message || 'Could not record the donation');
  }
  await db.from('pending_orders').update({ status: 'paid', result_id: donation.id }).eq('order_id', order_id);
  return ok({ receipt: await receipt(donation.id) });
});
