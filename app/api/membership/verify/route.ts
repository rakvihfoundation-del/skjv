import bcrypt from 'bcryptjs';
import type { MembershipPayload } from '@/lib/types';
import { ok, fail, body, str, publicRoute } from '@/lib/http';
import { verifyPayment, paymentMode } from '@/lib/payments';
import { createServiceClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { memberAuthEmail, MEMBER_COLUMNS } from '@/lib/auth';

// Step 2 of sign-up: verify the Razorpay payment, then create the Supabase Auth user and the member record,
// and sign the new member in. Safe to call twice (returns the same member).
export const POST = publicRoute(async (req) => {
  const b = await body(req);
  const order_id = str(b.order_id);
  const payment_id = str(b.payment_id);
  const signature = str(b.signature);
  const password = str(b.password);
  const db = createServiceClient();

  const { data: pending } = await db.from('pending_orders').select('*')
    .eq('order_id', order_id).eq('kind', 'membership').maybeSingle();
  if (!pending) return fail('Order not found', 404);
  const p = pending.payload as unknown as MembershipPayload;
  if (!bcrypt.compareSync(password, p.password_hash)) return fail('Please try again from the sign-up page.', 400);

  const signIn = async () => {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({ email: memberAuthEmail(p.phone), password });
    if (error) console.error('Member auto sign-in failed', error.message);
  };
  const loadMember = async (id: number) =>
    (await db.from('members').select(MEMBER_COLUMNS).eq('id', id).single()).data;

  // Already completed (e.g. the browser retried).
  if (pending.status === 'paid' && pending.result_id) {
    await signIn();
    return ok({ member: await loadMember(pending.result_id) });
  }
  if (!verifyPayment({ order_id, payment_id, signature })) return fail('Payment could not be verified');

  // Claim the order so two parallel requests cannot create two members.
  const { data: claimed } = await db.from('pending_orders').update({ status: 'processing' })
    .eq('order_id', order_id).eq('status', 'created').select('order_id');
  if (!claimed?.length) return fail('Your payment is being processed. Please wait a moment and refresh.', 409);
  const release = () => db.from('pending_orders').update({ status: 'created' }).eq('order_id', order_id);

  const { data: dup } = await db.from('members').select('id').eq('phone', p.phone).maybeSingle();
  if (dup) {
    return fail('This mobile number is already registered. Please contact us with your payment ID for a refund.', 409, { payment_id });
  }

  const authEmail = memberAuthEmail(p.phone);
  const { data: created, error: authError } = await db.auth.admin.createUser({
    email: authEmail,
    password,
    email_confirm: true,
    user_metadata: { role: 'member', name: p.name, phone: p.phone },
    app_metadata: { role: 'member' },
  });
  if (authError || !created.user) {
    await release();
    throw new Error(authError?.message || 'Could not create the account');
  }

  const { data: member, error: insertError } = await db.from('members').insert({
    user_id: created.user.id, auth_email: authEmail, name: p.name, email: p.email, phone: p.phone, ward: p.ward,
    pincode: p.pincode, photo: p.photo, amount: pending.amount, order_id, payment_id, payment_mode: paymentMode(),
  }).select(MEMBER_COLUMNS).single();
  if (insertError || !member) {
    await db.auth.admin.deleteUser(created.user.id);
    await release();
    throw new Error(insertError?.message || 'Could not save the membership');
  }

  await db.from('pending_orders').update({ status: 'paid', result_id: member.id }).eq('order_id', order_id);
  await signIn();
  return ok({ member });
});
