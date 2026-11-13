import 'server-only';
import crypto from 'crypto';

const KEY_ID = process.env.RAZORPAY_KEY_ID || '';
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';

export type PaymentMode = 'razorpay' | 'demo';
export type RazorpayOrder = { id: string; amount: number; currency: string };
export type PaymentProof = { order_id: string; payment_id: string; signature: string };

// When Razorpay keys are not configured the site runs in DEMO mode:
// a simulated checkout is shown and no money is charged.
export const paymentMode = (): PaymentMode => (KEY_ID && KEY_SECRET ? 'razorpay' : 'demo');
export const publicKey = (): string => KEY_ID;

/** Creates a Razorpay order (amount in rupees). */
export async function createOrder(amountRupees: number, receipt: string, notes: Record<string, string> = {}): Promise<RazorpayOrder> {
  const amount = Math.round(Number(amountRupees) * 100);
  if (paymentMode() === 'demo') {
    return { id: 'order_demo_' + crypto.randomBytes(8).toString('hex'), amount, currency: 'INR' };
  }
  const res = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Basic ' + Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString('base64'),
    },
    body: JSON.stringify({ amount, currency: 'INR', receipt: receipt.slice(0, 40), notes }),
  });
  if (!res.ok) {
    console.error('Razorpay order error', await res.text());
    throw new Error('Could not start payment. Please try again.');
  }
  return (await res.json()) as RazorpayOrder;
}

/** Checks the Razorpay signature (HMAC-SHA256 of "order_id|payment_id" with the key secret). */
export function verifyPayment({ order_id, payment_id, signature }: Partial<PaymentProof>): boolean {
  if (!order_id || !payment_id) return false;
  if (paymentMode() === 'demo') {
    return order_id.startsWith('order_demo_') && payment_id.startsWith('pay_demo_');
  }
  if (!signature) return false;
  const expected = crypto.createHmac('sha256', KEY_SECRET).update(`${order_id}|${payment_id}`).digest('hex');
  const a = Buffer.from(expected);
  const b = Buffer.from(String(signature));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
