'use client';
import type { ChangeEvent, FormEvent } from 'react';
import type { LucideIcon } from 'lucide-react';
import type { DonationReceipt } from '@/lib/types';
import { useRef, useState } from 'react';
import { HandCoins, GraduationCap, Activity, Sprout, HandHeart, Loader2, ShieldCheck, Download, CheckCircle2, Lock } from 'lucide-react';
import { useSite } from '@/components/site/Providers';
import PageHero from '@/components/site/PageHero';
import Reveal from '@/components/site/Reveal';
import { usePayment, CANCELLED } from '@/components/site/Payment';
import { Confetti } from './JoinView';
import { PHONE_RE, EMAIL_RE, fmtDate, inr } from '@/lib/utils';

const AMOUNTS = [500, 1000, 2500, 5000, 10000];

function Receipt({ r }: { r: DonationReceipt }) {
  const { t, lang, settings } = useSite();
  const ref = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  async function download() {
    if (!ref.current) return;
    setBusy(true);
    try {
      const { toPng } = await import('html-to-image');
      const url = await toPng(ref.current, { pixelRatio: 2, cacheBust: true });
      const a = document.createElement('a');
      a.href = url; a.download = `${r.receipt_no}.png`; a.click();
    } finally { setBusy(false); }
  }
  const camp = t('donate.general');
  return (
    <>
      <div className="receipt" ref={ref}>
        <div className="receipt-head">
          <img src="/images/logo.webp" alt="" />
          <div><b>{t('org.name')}</b><small>{t('org.tagline')}</small></div>
        </div>
        <div className="receipt-title"><span>{t('donate.receipt')}</span><b>{inr(r.amount)}</b></div>
        <dl>
          <div><dt>{t('donate.receiptNo')}</dt><dd>{r.receipt_no}</dd></div>
          <div><dt>{t('donate.date')}</dt><dd>{fmtDate(r.created_at, lang)}</dd></div>
          <div><dt>{t('donate.name')}</dt><dd>{r.name}</dd></div>
          {r.pan && <div><dt>{t('donate.pan')}</dt><dd>{r.pan}</dd></div>}
          <div><dt>{t('donate.cause')}</dt><dd>{camp}</dd></div>
          <div><dt>{t('donate.paymentId')}</dt><dd className="mono">{r.payment_id}</dd></div>
        </dl>
        <p className="receipt-foot">{lang === 'kn' ? settings.address_kn || settings.address_en : settings.address_en}<br />{settings.phone} · {settings.email}</p>
        <div className="receipt-flag"><i /><i /></div>
      </div>
      <button className="btn btn-fire" onClick={download} disabled={busy}>{busy ? <Loader2 className="spin" size={18} /> : <Download size={18} />}{t('common.download')}</button>
    </>
  );
}

export default function DonateView() {
  const { t, tr } = useSite();
  const { pay, modal } = usePayment();
  const [amount, setAmount] = useState(1000);
  const [custom, setCustom] = useState('');
  const [f, setF] = useState({ name: '', phone: '', email: '', pan: '', message: '', anonymous: false });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [receipt, setReceipt] = useState<DonationReceipt | null>(null);
  const value = custom ? Number(custom) : amount;
  const set = (k: keyof typeof f) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setF({ ...f, [k]: e.target instanceof HTMLInputElement && e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  async function submit(e: FormEvent) {
    e.preventDefault();
    setErr('');
    if (f.name.trim().length < 2) return setErr(t('join.err.name'));
    if (!PHONE_RE.test(f.phone)) return setErr(t('join.err.phone'));
    if (f.email && !EMAIL_RE.test(f.email)) return setErr(t('join.err.email'));
    if (!value || value < 10) return setErr('Minimum ₹10');
    setBusy(true);
    try {
      const d = await pay<{ receipt: DonationReceipt }>('donate', { ...f, amount: value });
      setReceipt(d.receipt);
      window.scrollTo({ top: 200, behavior: 'smooth' });
    } catch (ex) {
      const msg = ex instanceof Error ? ex.message : String(ex);
      setErr(msg === CANCELLED ? t('pay.cancelled') : msg);
    } finally {
      setBusy(false);
    }
  }

  const impact: [LucideIcon, string][] = [[GraduationCap, 'donate.why1'], [Activity, 'donate.why2'], [Sprout, 'donate.why3'], [HandHeart, 'donate.why4']];

  return (
    <>
      <PageHero title={t('donate.title')} sub={t('donate.sub')} image="/images/gallery/soudha-sunset.jpg" crumbs={[{ label: t('nav.donate') }]} />
      <section className="section">
        <div className="container donate-layout">
          <div className="donate-why">
            <Reveal className="donate-quote">
              <HandCoins size={32} />
              <p>“{t('org.tagline')}”</p>
            </Reveal>
            <Reveal as="h2" className="display sm" delay={60}>{t('donate.whyTitle')}</Reveal>
            <div className="impact">
              {impact.map(([I, k], i) => (
                <Reveal key={k} className="impact-item" delay={100 + i * 60}><span><I size={22} /></span><p>{t(k)}</p></Reveal>
              ))}
            </div>
            <Reveal className="donate-img" delay={200}><img loading="lazy" decoding="async" src="/images/our-works.jpg" alt="" /></Reveal>
          </div>

          <div className="card-panel donate-form">
            {receipt ? (
              <div className="receipt-wrap">
                <Confetti />
                <CheckCircle2 className="ok-icon" size={52} />
                <h3>{t('donate.thanks')}</h3>
                <p className="muted">{t('donate.thanksText')}</p>
                <Receipt r={receipt} />
                <button className="btn btn-ghost" onClick={() => { setReceipt(null); setCustom(''); }}>{t('donate.another')}</button>
              </div>
            ) : (
              <form onSubmit={submit} noValidate>
                <h3 className="panel-title">{t('donate.amount')}</h3>
                <div className="amounts">
                  {AMOUNTS.map((a) => (
                    <button type="button" key={a} className={!custom && amount === a ? 'on' : ''} onClick={() => { setAmount(a); setCustom(''); }}>{inr(a)}</button>
                  ))}
                  <div className={`amount-custom ${custom ? 'on' : ''}`}>
                    <span>₹</span>
                    <input inputMode="numeric" placeholder={t('donate.custom')} value={custom} onChange={(e) => setCustom(e.target.value.replace(/\D/g, '').slice(0, 7))} />
                  </div>
                </div>
                <div className="form-grid">
                  <label className="field full"><span>{t('donate.name')}</span><input className="input" value={f.name} onChange={set('name')} autoComplete="name" /></label>
                  <label className="field"><span>{t('donate.phone')}</span><input className="input" inputMode="numeric" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} autoComplete="tel-national" /></label>
                  <label className="field"><span>{t('donate.email')} <em>· {t('join.optional')}</em></span><input className="input" type="email" value={f.email} onChange={set('email')} /></label>
                  <label className="field full"><span>{t('donate.pan')} <em>· {t('join.optional')}</em></span><input className="input upper" maxLength={10} value={f.pan} onChange={set('pan')} placeholder="ABCDE1234F" /></label>
                  <label className="field full"><span>{t('donate.message')}</span><textarea className="input" rows={3} value={f.message} onChange={set('message')} maxLength={500} /></label>
                </div>
                <label className="check-line"><input type="checkbox" checked={f.anonymous} onChange={set('anonymous')} /><span>{t('donate.anon')}</span></label>
                {err && <p className="form-error">{err}</p>}
                <button className="btn btn-fire btn-lg btn-block" disabled={busy}>
                  {busy ? <Loader2 className="spin" size={18} /> : <Lock size={18} />}{t('donate.btn')} {value ? inr(value) : ''}
                </button>
                <p className="secure-note"><ShieldCheck size={15} />{t('join.secure')}</p>
              </form>
            )}
          </div>
        </div>
      </section>
      {modal}
    </>
  );
}
