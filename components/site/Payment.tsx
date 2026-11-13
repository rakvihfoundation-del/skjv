'use client';
import { useState, type ReactNode } from 'react';
import { ShieldCheck, Smartphone, CreditCard, Landmark, Loader2, X, FlaskConical, type LucideIcon } from 'lucide-react';
import { useSite } from './Providers';

export const CANCELLED = 'PAYMENT_CANCELLED';

/** What /api/<kind>/order returns. */
type Order = {
  mode: 'razorpay' | 'demo';
  key: string;
  order_id: string;
  amount: number;
  currency: string;
  description: string;
  prefill: { name: string; email: string; contact: string };
};

type PaymentResult = { order_id: string; payment_id: string; signature: string };

type RazorpaySuccess = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };
type RazorpayOptions = {
  key: string; amount: number; currency: string; order_id: string; name: string; description: string; image: string;
  prefill: Order['prefill']; theme: { color: string };
  handler: (r: RazorpaySuccess) => void;
  modal: { ondismiss: () => void };
};
type RazorpayInstance = { open: () => void; on: (event: 'payment.failed', cb: (e: { error?: { description?: string } }) => void) => void };

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

function loadRazorpay(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve();
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Could not load payment gateway. Check your internet connection.'));
    document.body.appendChild(s);
  });
}

type Pending = { order: Order; resolve: (r: PaymentResult) => void; reject: (e: Error) => void };

/** Creates an order on the server, collects payment (Razorpay or demo) and verifies it. */
export function usePayment(): {
  pay: <T>(kind: 'membership' | 'donate', payload: Record<string, unknown>, verifyExtra?: Record<string, unknown>) => Promise<T>;
  modal: ReactNode;
} {
  const [demo, setDemo] = useState<Pending | null>(null);

  async function pay<T>(kind: 'membership' | 'donate', payload: Record<string, unknown>, verifyExtra: Record<string, unknown> = {}): Promise<T> {
    const r = await fetch(`/api/${kind}/order`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const order = (await r.json()) as Order & { error?: string };
    if (!r.ok) throw new Error(order.error || 'Could not start payment');

    let resp: PaymentResult;
    if (order.mode === 'razorpay') {
      await loadRazorpay();
      const Razorpay = window.Razorpay;
      if (!Razorpay) throw new Error('Could not load payment gateway.');
      resp = await new Promise<PaymentResult>((resolve, reject) => {
        const rz = new Razorpay({
          key: order.key, amount: order.amount, currency: order.currency, order_id: order.order_id,
          name: 'Suvarna Karnataka Janashakti Vedike', description: order.description,
          image: `${window.location.origin}/images/logo-192.png`, prefill: order.prefill, theme: { color: '#C8102E' },
          handler: (x) => resolve({ order_id: x.razorpay_order_id, payment_id: x.razorpay_payment_id, signature: x.razorpay_signature }),
          modal: { ondismiss: () => reject(new Error(CANCELLED)) },
        });
        rz.on('payment.failed', (e) => reject(new Error(e.error?.description || 'Payment failed')));
        rz.open();
      });
    } else {
      resp = await new Promise<PaymentResult>((resolve, reject) => setDemo({ order, resolve, reject }));
    }

    const v = await fetch(`/api/${kind}/verify`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...resp, ...verifyExtra }),
    });
    const data = (await v.json()) as T & { error?: string };
    if (!v.ok) throw new Error(data.error || 'Payment verification failed');
    return data;
  }

  const modal = demo ? (
    <DemoCheckout
      order={demo.order}
      onSuccess={(x) => { demo.resolve(x); setDemo(null); }}
      onCancel={() => { demo.reject(new Error(CANCELLED)); setDemo(null); }}
    />
  ) : null;

  return { pay, modal };
}

type Method = 'upi' | 'card' | 'nb';

function DemoCheckout({ order, onSuccess, onCancel }: { order: Order; onSuccess: (r: PaymentResult) => void; onCancel: () => void }) {
  const { t } = useSite();
  const label = order.description === 'Donation' ? t('pay.donation') : t('pay.membership');
  const [method, setMethod] = useState<Method>('upi');
  const [busy, setBusy] = useState(false);
  const amount = (order.amount / 100).toLocaleString('en-IN');
  const methods: [Method, string, LucideIcon][] = [['upi', t('pay.upi'), Smartphone], ['card', t('pay.card'), CreditCard], ['nb', t('pay.netbanking'), Landmark]];

  const submit = () => {
    setBusy(true);
    setTimeout(() => onSuccess({ order_id: order.order_id, payment_id: 'pay_demo_' + Math.random().toString(36).slice(2, 12), signature: 'demo' }), 1600);
  };

  return (
    <div className="modal-wrap" role="dialog" aria-modal="true">
      <div className="modal-backdrop" onClick={busy ? undefined : onCancel} />
      <div className="paybox">
        <div className="paybox-head">
          <img src="/images/logo.webp" alt="" />
          <div>
            <small>{t('pay.to')}</small>
            <b>{t('org.name')}</b>
          </div>
          {!busy && <button className="paybox-x" onClick={onCancel} aria-label={t('pay.cancel')}><X size={18} /></button>}
        </div>
        <div className="paybox-amount">
          <span>{label}</span>
          <b>₹{amount}</b>
        </div>
        <div className="paybox-demo"><FlaskConical size={16} /><span><b>{t('pay.demo')}</b> — {t('pay.demoNote')}</span></div>
        {busy ? (
          <div className="paybox-busy"><Loader2 className="spin" size={36} /><p>{t('pay.processing')}</p></div>
        ) : (
          <>
            <div className="paybox-methods">
              {methods.map(([k, name, I]) => (
                <button key={k} className={method === k ? 'on' : ''} onClick={() => setMethod(k)}><I size={20} />{name}</button>
              ))}
            </div>
            <div className="paybox-field">
              {method === 'upi' && <input className="input" defaultValue="member@upi" aria-label="UPI ID" />}
              {method === 'card' && <input className="input" defaultValue="4111 1111 1111 1111" aria-label="Card number" />}
              {method === 'nb' && <select className="input" defaultValue="SBI" aria-label="Bank"><option>SBI</option><option>Canara Bank</option><option>Karnataka Bank</option><option>HDFC Bank</option></select>}
            </div>
            <button className="btn btn-fire btn-block btn-lg" onClick={submit}>{t('pay.payNow')} ₹{amount}</button>
          </>
        )}
        <p className="paybox-secure"><ShieldCheck size={14} />{t('join.secure')}</p>
      </div>
    </div>
  );
}
