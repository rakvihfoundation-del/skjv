'use client';
import Link from 'next/link';
import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import {
  User, Phone, Mail, Lock, MapPinned, Hash, Eye, EyeOff, Loader2, Upload, FileText, CheckCircle2, ShieldCheck,
  HeartHandshake, CalendarCheck2, Gift, IdCard as IdIcon, PartyPopper, ArrowRight, X, BadgeCheck,
} from 'lucide-react';
import { useSite } from '@/components/site/Providers';
import { useDialog } from '@/components/site/Dialog';
import { Input } from './JoinView';
import { PHONE_RE, PIN_RE, EMAIL_RE, wardLabel } from '@/lib/utils';
import { PROOF_TYPES, type ProofType, type VolunteerPublic } from '@/lib/types';

type Form = { name: string; phone: string; email: string; password: string; confirm: string; ward: string; pincode: string; proof_type: ProofType | '' };
type Proof = { ref: string; name: string; type: string } | null;

/** Free volunteer sign-up: details + one ID proof. No payment, no photo, no ID card. */
export default function VolunteerForm({ wards }: { wards: string[] }) {
  const { t, lang } = useSite();
  const { notify } = useDialog();
  const [f, setF] = useState<Form>({ name: '', phone: '', email: '', password: '', confirm: '', ward: '', pincode: '', proof_type: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof Form | 'proof' | 'agree', string>>>({});
  const [proof, setProof] = useState<Proof>(null);
  const [upBusy, setUpBusy] = useState(false);
  const [agree, setAgree] = useState(false);
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [done, setDone] = useState<VolunteerPublic | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (k: keyof Form) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let v = e.target.value;
    if (k === 'phone') v = v.replace(/\D/g, '').slice(0, 10);
    if (k === 'pincode') v = v.replace(/\D/g, '').slice(0, 6);
    setF((x) => ({ ...x, [k]: v }));
    if (errors[k]) setErrors((x) => ({ ...x, [k]: '' }));
  };

  async function upload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUpBusy(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const r = await fetch('/api/volunteer/proof', { method: 'POST', body: fd });
      const d = (await r.json().catch(() => ({}))) as { ref?: string; name?: string; type?: string; error?: string };
      if (!r.ok || !d.ref) throw new Error(d.error || 'Upload failed');
      setProof({ ref: d.ref, name: d.name || file.name, type: d.type || file.type });
      setErrors((x) => ({ ...x, proof: '' }));
      notify(t('vol.uploaded'));
    } catch (ex) {
      notify(ex instanceof Error ? ex.message : String(ex), 'error');
    } finally {
      setUpBusy(false);
    }
  }

  function validate() {
    const e: typeof errors = {};
    if (f.name.trim().length < 2) e.name = t('join.err.name');
    if (!PHONE_RE.test(f.phone)) e.phone = t('join.err.phone');
    if (f.email && !EMAIL_RE.test(f.email)) e.email = t('join.err.email');
    if (f.password.length < 6) e.password = t('join.err.pass');
    if (f.password !== f.confirm) e.confirm = t('join.err.match');
    if (!f.ward) e.ward = t('join.err.ward');
    if (!PIN_RE.test(f.pincode)) e.pincode = t('join.err.pin');
    if (!f.proof_type) e.proof_type = t('vol.err.proofType');
    if (!proof) e.proof = t('vol.err.proof');
    if (!agree) e.agree = t('vol.err.agree');
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setErr('');
    if (!validate()) { notify(t('vol.err.fix'), 'error'); return; }
    setBusy(true);
    try {
      const r = await fetch('/api/volunteer/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...f, proof: proof?.ref, agree: true }),
      });
      const d = (await r.json().catch(() => ({}))) as { volunteer?: VolunteerPublic; error?: string };
      if (!r.ok || !d.volunteer) throw new Error(d.error || 'Something went wrong');
      setDone(d.volunteer);
      window.dispatchEvent(new Event('skjv:auth'));
      notify(t('vol.doneToast'));
      window.scrollTo({ top: 200, behavior: 'smooth' });
    } catch (ex) {
      const msg = ex instanceof Error ? ex.message : String(ex);
      setErr(msg);
      notify(msg, 'error');
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="card-panel vol-done">
        <span className="vol-done-icon"><PartyPopper size={34} /></span>
        <h2>{t('vol.doneTitle')}</h2>
        <p>{t('vol.doneText')}</p>
        <div className="vol-done-no"><small>{t('vol.yourNo')}</small><b>{done.volunteer_no}</b></div>
        <p className="vol-done-note"><ShieldCheck size={16} />{t('vol.doneVerify')}</p>
        <div className="vol-done-actions">
          <Link href="/campaigns" className="btn btn-fire btn-lg"><CalendarCheck2 size={18} />{t('vol.goEvents')}</Link>
          <Link href="/profile" className="btn btn-ghost btn-lg">{t('nav.profile')}<ArrowRight size={18} /></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="join-layout">
      <form className="card-panel join-form vol-form" onSubmit={submit} noValidate>
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

        {/* ID proof: any one */}
        <fieldset className={`proof-box ${errors.proof || errors.proof_type ? 'has-error' : ''}`}>
          <legend><IdIcon size={18} />{t('vol.proofTitle')}</legend>
          <p className="proof-help">{t('vol.proofHelp')}</p>
          <div className="proof-types" role="radiogroup" aria-label={t('vol.proofTitle')}>
            {PROOF_TYPES.map((p) => (
              <label key={p} className={`proof-type ${f.proof_type === p ? 'on' : ''}`}>
                <input type="radio" name="proof_type" value={p} checked={f.proof_type === p}
                  onChange={() => { setF((x) => ({ ...x, proof_type: p })); setErrors((x) => ({ ...x, proof_type: '' })); }} />
                <span>{t(`vol.proof.${p}`)}</span>
              </label>
            ))}
          </div>
          {errors.proof_type && <small className="field-error">{errors.proof_type}</small>}

          {proof ? (
            <div className="proof-file">
              <FileText size={22} />
              <div><b>{proof.name}</b><small><CheckCircle2 size={13} />{t('vol.uploadedShort')}</small></div>
              <button type="button" className="btn btn-ghost btn-xs" onClick={() => fileRef.current?.click()} disabled={upBusy}>{t('vol.replace')}</button>
              <button type="button" className="proof-x" onClick={() => setProof(null)} aria-label={t('common.close')}><X size={16} /></button>
            </div>
          ) : (
            <button type="button" className="proof-drop" onClick={() => fileRef.current?.click()} disabled={upBusy}>
              {upBusy ? <Loader2 className="spin" size={24} /> : <Upload size={24} />}
              <b>{upBusy ? t('vol.uploading') : t('vol.upload')}</b>
              <small>{t('vol.uploadHint')}</small>
            </button>
          )}
          {errors.proof && <small className="field-error">{errors.proof}</small>}
          <p className="proof-private"><ShieldCheck size={15} />{t('vol.privacy')}</p>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,application/pdf" hidden onChange={upload} />
        </fieldset>

        <label className={`agree vol-agree ${agree ? 'on' : ''} ${errors.agree ? 'shake' : ''}`}>
          <input type="checkbox" checked={agree} onChange={(e) => { setAgree(e.target.checked); setErrors((x) => ({ ...x, agree: '' })); }} />
          <span className="agree-box"><CheckCircle2 size={18} /></span>
          <span>{t('vol.declare')}</span>
        </label>
        {errors.agree && <small className="field-error">{errors.agree}</small>}

        {err && <p className="form-error">{err}</p>}
        <div className="join-foot">
          <button className="btn btn-fire btn-lg" disabled={busy || upBusy}>
            {busy ? <Loader2 className="spin" size={18} /> : <HeartHandshake size={18} />}{t('vol.submit')}
          </button>
        </div>
      </form>

      <aside className="join-aside">
        <div className="sticky vol-aside">
          <p className="aside-label"><HeartHandshake size={16} />{t('vol.whyTitle')}</p>
          <ul className="vol-perks">
            <li><Gift size={20} /><div><b>{t('vol.perk1')}</b><small>{t('vol.perk1s')}</small></div></li>
            <li><CalendarCheck2 size={20} /><div><b>{t('vol.perk2')}</b><small>{t('vol.perk2s')}</small></div></li>
            <li><BadgeCheck size={20} /><div><b>{t('vol.perk3')}</b><small>{t('vol.perk3s')}</small></div></li>
          </ul>
          <p className="vol-note">{t('vol.noCard')}</p>
        </div>
      </aside>
    </div>
  );
}
