'use client';
import Link from 'next/link';
import { useRef, useState, type ChangeEvent, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from 'react';
import type { LucideIcon } from 'lucide-react';
import type { MemberPublic } from '@/lib/types';
import { User, Phone, Mail, Lock, MapPinned, Hash, Camera, Eye, EyeOff, ArrowRight, ArrowLeft, ShieldCheck, Loader2, CheckCircle2, X, Pencil, BadgeCheck, IdCard as IdIcon, PartyPopper, HeartHandshake } from 'lucide-react';
import { useSite } from '@/components/site/Providers';
import VolunteerForm from './VolunteerForm';
import PageHero from '@/components/site/PageHero';
import IdCard from '@/components/site/IdCard';
import { usePayment, CANCELLED } from '@/components/site/Payment';
import { TermsContent } from './TermsView';
import { PHONE_RE, PIN_RE, EMAIL_RE, wardLabel } from '@/lib/utils';

// Step bar. Steps ahead are locked: hovering or tapping them explains what to finish first.
function Steps({ step, onBack }: { step: number; onBack: () => void }) {
  const { t } = useSite();
  const [tip, setTip] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const items: [string, LucideIcon][] = [['join.step1', User], ['join.step2', ShieldCheck], ['join.step3', IdIcon]];
  const lockMsg = (n: number) => (n === 2 ? t('join.lock2') : step < 2 ? t('join.lock2') : t('join.lock3'));
  function click(n: number) {
    if (n > step) {
      setTip(n);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setTip(null), 2600);
    } else if (n === 1 && step === 2) onBack();
  }
  return (
    <ol className="steps">
      {items.map(([k, I], i) => {
        const n = i + 1;
        const locked = n > step;
        return (
          <li key={k} className={`${step > n ? 'done' : step === n ? 'on' : ''} ${locked ? 'locked' : ''} ${tip === n ? 'show-tip' : ''}`}>
            <button type="button" onClick={() => click(n)} aria-disabled={locked} aria-describedby={locked ? `step-tip-${n}` : undefined}>
              <span>{step > n ? <CheckCircle2 size={18} /> : locked ? <Lock size={16} /> : <I size={18} />}</span>
              <b>{t(k)}</b>
            </button>
            {locked && <em className="step-tip" role="tooltip" id={`step-tip-${n}`}>{lockMsg(n)}</em>}
          </li>
        );
      })}
    </ol>
  );
}

type InputBase = { icon: LucideIcon; label: string; error?: string; optional?: boolean; right?: ReactNode };
type TextInputProps = InputBase & { as?: 'input' } & InputHTMLAttributes<HTMLInputElement>;
type SelectInputProps = InputBase & { as: 'select' } & SelectHTMLAttributes<HTMLSelectElement>;

export function Input(props: TextInputProps | SelectInputProps) {
  const { t } = useSite();
  const { icon: I, label, error, optional, right } = props;
  let control: ReactNode;
  if (props.as === 'select') {
    const { icon: _i, label: _l, error: _e, optional: _o, right: _r, as: _a, ...p } = props;
    control = <select className="input" {...p} />;
  } else {
    const { icon: _i, label: _l, error: _e, optional: _o, right: _r, as: _a, ...p } = props;
    control = <input className="input" {...p} />;
  }
  return (
    <label className={`field ${error ? 'has-error' : ''}`}>
      <span>{label}{optional && <em> · {t('join.optional')}</em>}</span>
      <div className="input-icon">
        <I size={18} />
        {control}
        {right}
      </div>
      {error && <small className="field-error">{error}</small>}
    </label>
  );
}

export function Confetti() {
  const colors = ['#C8102E', '#FFC72C', '#F5A623', '#0E7A43', '#FFE14D'];
  return (
    <div className="confetti" aria-hidden="true">
      {Array.from({ length: 60 }).map((_, i) => (
        <i key={i} style={{
          left: `${(i * 37) % 100}%`, background: colors[i % colors.length],
          animationDelay: `${(i % 12) * 0.08}s`, animationDuration: `${2.4 + (i % 5) * 0.35}s`,
          transform: `rotate(${i * 29}deg)`,
        }} />
      ))}
    </div>
  );
}

type Form = { name: string; phone: string; email: string; password: string; confirm: string; ward: string; pincode: string; photo: string };

export type JoinType = 'community' | 'volunteer';

export default function JoinView({ wards, type = 'community' }: { wards: string[]; type?: JoinType }) {
  const { t, settings, lang } = useSite();
  const { pay, modal } = usePayment();
  const [step, setStep] = useState(1);
  const [f, setF] = useState<Form>({ name: '', phone: '', email: '', password: '', confirm: '', ward: '', pincode: '', photo: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [show, setShow] = useState(false);
  const [agree, setAgree] = useState(false);
  const [nudge, setNudge] = useState(false);
  const [terms, setTerms] = useState(false);
  const [busy, setBusy] = useState(false);
  const [upBusy, setUpBusy] = useState(false);
  const [err, setErr] = useState('');
  const [member, setMember] = useState<MemberPublic | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const fee = Number(settings.membership_fee || 1500).toLocaleString('en-IN');

  const set = (k: keyof Form) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let v = e.target.value;
    if (k === 'phone') v = v.replace(/\D/g, '').slice(0, 10);
    if (k === 'pincode') v = v.replace(/\D/g, '').slice(0, 6);
    setF((x) => ({ ...x, [k]: v }));
    if (errors[k]) setErrors((x) => ({ ...x, [k]: '' }));
  };

  function validate() {
    const e: Partial<Record<keyof Form, string>> = {};
    if (f.name.trim().length < 2) e.name = t('join.err.name');
    if (!PHONE_RE.test(f.phone)) e.phone = t('join.err.phone');
    if (f.email && !EMAIL_RE.test(f.email)) e.email = t('join.err.email');
    if (f.password.length < 6) e.password = t('join.err.pass');
    if (f.password !== f.confirm) e.confirm = t('join.err.match');
    if (!f.ward) e.ward = t('join.err.ward');
    if (!PIN_RE.test(f.pincode)) e.pincode = t('join.err.pin');
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function upload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUpBusy(true);
    setErr('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const r = await fetch('/api/upload/photo', { method: 'POST', body: fd });
      const d = (await r.json()) as { url?: string; error?: string };
      if (!r.ok || !d.url) throw new Error(d.error || 'Upload failed');
      const url = d.url;
      setF((x) => ({ ...x, photo: url }));
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : String(ex));
    } finally {
      setUpBusy(false);
      e.target.value = '';
    }
  }

  async function submitPayment() {
    if (!agree) { setNudge(true); setTimeout(() => setNudge(false), 700); setErr(t('join.mustAgree')); return; }
    setBusy(true);
    setErr('');
    try {
      // The password is sent again with the verification so the new account can be signed in.
      const d = await pay<{ member: MemberPublic }>('membership', { ...f, agree: true }, { password: f.password });
      setMember(d.member);
      setStep(3);
      window.dispatchEvent(new Event('skjv:auth'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (ex) {
      const msg = ex instanceof Error ? ex.message : String(ex);
      setErr(msg === CANCELLED ? t('pay.cancelled') : msg);
    } finally {
      setBusy(false);
    }
  }

  const preview = { ...f, member_no: member?.member_no, created_at: member?.created_at };

  return (
    <>
      <PageHero
        title={type === 'volunteer' ? t('vol.title') : t('join.title')}
        sub={type === 'volunteer' ? t('vol.sub') : t('join.sub')}
        image={type === 'volunteer' ? '/images/gallery/rally-crowd.jpg' : '/images/gallery/rally-flags.jpg'}
        crumbs={[{ label: t('nav.signup') }]}
      >
        {/* Two ways to join */}
        <div className="join-types" role="tablist" aria-label={t('nav.signup')}>
          <Link href="/join" scroll={false} replace role="tab" aria-selected={type === 'community'} className={`join-type ${type === 'community' ? 'on' : ''}`}>
            <span className="join-type-icon"><IdIcon size={20} /></span>
            <span><b>{t('join.typeCommunity')}</b><small>{t('join.typeCommunitySub').replace('{fee}', fee)}</small></span>
          </Link>
          <Link href="/join?type=volunteer" scroll={false} replace role="tab" aria-selected={type === 'volunteer'} className={`join-type vol ${type === 'volunteer' ? 'on' : ''}`}>
            <span className="join-type-icon"><HeartHandshake size={20} /></span>
            <span><b>{t('join.typeVolunteer')}</b><small>{t('join.typeVolunteerSub')}</small></span>
          </Link>
        </div>
      </PageHero>
      <section className={`section join-sec ${type === 'volunteer' ? 'is-vol' : ''}`}>
        <div className="container">
          {type === 'volunteer' ? <VolunteerForm wards={wards} /> : <>
          <Steps step={step} onBack={() => setStep(1)} />

          {step === 1 && (
            <div className="join-layout">
              <form className="card-panel join-form" onSubmit={(e) => { e.preventDefault(); if (validate()) { setStep(2); window.scrollTo({ top: 200, behavior: 'smooth' }); } }} noValidate>
                <div className="photo-pick">
                  <button type="button" className="photo-circle" onClick={() => fileRef.current?.click()} aria-label={t('join.upload')}>
                    {upBusy ? <Loader2 className="spin" size={26} /> : f.photo ? <img src={f.photo} alt="" /> : <Camera size={26} />}
                  </button>
                  <div>
                    <b>{t('join.photo')}</b>
                    <small>{t('join.photoHint')}</small>
                    <button type="button" className="btn btn-ghost btn-xs" onClick={() => fileRef.current?.click()}>{f.photo ? t('join.change') : t('join.upload')}</button>
                  </div>
                  <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={upload} />
                </div>

                <div className="form-grid">
                  <div className="full"><Input icon={User} label={t('join.name')} value={f.name} onChange={set('name')} error={errors.name} autoComplete="name" maxLength={60} /></div>
                  <Input icon={Phone} label={t('join.phone')} value={f.phone} onChange={set('phone')} error={errors.phone} inputMode="numeric" autoComplete="tel-national" placeholder="98XXXXXXXX" />
                  <Input icon={Mail} label={t('join.email')} optional type="email" value={f.email} onChange={set('email')} error={errors.email} autoComplete="email" />
                  <Input icon={Lock} label={t('join.password')} type={show ? 'text' : 'password'} value={f.password} onChange={set('password')} error={errors.password} autoComplete="new-password"
                    right={<button type="button" className="eye" onClick={() => setShow(!show)} aria-label="Show password">{show ? <EyeOff size={18} /> : <Eye size={18} />}</button>} />
                  <Input icon={Lock} label={t('join.confirm')} type={show ? 'text' : 'password'} value={f.confirm} onChange={set('confirm')} error={errors.confirm} autoComplete="new-password" />
                  <Input icon={MapPinned} as="select" label={t('join.ward')} value={f.ward} onChange={set('ward')} error={errors.ward}>
                    <option value="">{t('join.selectWard')}</option>
                    {wards.map((w) => <option key={w} value={w}>{wardLabel(w, lang)}</option>)}
                  </Input>
                  <Input icon={Hash} label={t('join.pincode')} value={f.pincode} onChange={set('pincode')} error={errors.pincode} inputMode="numeric" placeholder="560001" />
                </div>
                {err && <p className="form-error">{err}</p>}
                <div className="join-foot">
                  <button className="btn btn-fire btn-lg">{t('common.next')}<ArrowRight size={18} /></button>
                </div>
              </form>

              <aside className="join-aside">
                <div className="sticky">
                  <p className="aside-label"><BadgeCheck size={16} />{t('join.preview')}</p>
                  <IdCard member={preview} actions={false} />
                  <div className="fee-pill"><span>{t('join.feeTitle')}</span><b>₹{fee}</b><small>{t('join.feeOnce')}</small></div>
                </div>
              </aside>
            </div>
          )}

          {step === 2 && (
            <div className="join-layout">
              <div className="card-panel pay-panel">
                <h3 className="panel-title">{t('join.summary')}
                  <button className="btn btn-ghost btn-xs" onClick={() => setStep(1)}><Pencil size={14} />{t('common.back')}</button>
                </h3>
                <dl className="summary">
                  {[['join.name', f.name], ['join.phone', '+91 ' + f.phone], ['join.email', f.email || '—'], ['join.ward', wardLabel(f.ward, lang)], ['join.pincode', f.pincode]].map(([k, v]) => (
                    <div key={k}><dt>{t(k)}</dt><dd>{v}</dd></div>
                  ))}
                </dl>

                <div className="fee-box">
                  <div><span>{t('join.feeTitle')}</span><small>{t('join.feeOnce')}</small></div>
                  <b>₹{fee}</b>
                </div>

                <label className={`agree ${agree ? 'on' : ''} ${nudge ? 'shake' : ''}`}>
                  <input type="checkbox" checked={agree} onChange={(e) => { setAgree(e.target.checked); setErr(''); }} />
                  <span className="agree-box"><CheckCircle2 size={18} /></span>
                  <span>{t('join.agree1')} <button type="button" className="link" onClick={() => setTerms(true)}>{t('join.terms')}</button> {t('join.agree2')}</span>
                </label>

                {err && <p className="form-error">{err}</p>}

                <div className="pay-actions">
                  <button className="btn btn-ghost" onClick={() => setStep(1)}><ArrowLeft size={18} />{t('common.prev')}</button>
                  <button className={`btn btn-fire btn-lg grow ${!agree ? 'is-disabled' : ''}`} onClick={submitPayment} disabled={busy} aria-disabled={!agree}>
                    {busy ? <Loader2 className="spin" size={18} /> : <Lock size={18} />}{t('join.pay')} · ₹{fee}
                  </button>
                </div>
                <p className="secure-note"><ShieldCheck size={15} />{t('join.secure')}</p>
              </div>
              <aside className="join-aside">
                <div className="sticky">
                  <p className="aside-label"><BadgeCheck size={16} />{t('join.preview')}</p>
                  <IdCard member={preview} actions={false} />
                </div>
              </aside>
            </div>
          )}

          {step === 3 && member && (
            <div className="success-wrap">
              <Confetti />
              <div className="success-head">
                <span className="success-icon"><PartyPopper size={34} /></span>
                <h2 className="display">{t('join.successTitle')}</h2>
                <p className="lead">{t('join.successText')}</p>
                <p className="member-no-pill">{t('card.memberNo')}: <b>{member.member_no}</b></p>
              </div>
              <div className="success-card"><IdCard member={member} /></div>
              <div className="btn-row center">
                <Link href="/my-card" className="btn btn-dark">{t('nav.mycard')}<ArrowRight size={18} /></Link>
                <Link href="/campaigns" className="btn btn-ghost">{t('nav.campaigns')}</Link>
              </div>
            </div>
          )}
          </>}
        </div>
      </section>

      {terms && (
        <div className="modal-wrap" role="dialog" aria-modal="true">
          <div className="modal-backdrop" onClick={() => setTerms(false)} />
          <div className="modal">
            <div className="modal-head"><h3>{t('terms.title')}</h3><button onClick={() => setTerms(false)} aria-label={t('common.close')}><X size={20} /></button></div>
            <div className="modal-body"><TermsContent /></div>
            <div className="modal-foot">
              <button className="btn btn-fire" onClick={() => { setAgree(true); setTerms(false); setErr(''); }}><CheckCircle2 size={18} />{t('join.terms')} ✓</button>
            </div>
          </div>
        </div>
      )}
      {modal}
    </>
  );
}
