'use client';
import type { FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Lock, UserRound, Loader2, ArrowRight, Eye, EyeOff, CalendarCheck2, IdCard, HeartHandshake, BadgeCheck, LayoutList, ShieldCheck, type LucideIcon } from 'lucide-react';
import { useSite } from '@/components/site/Providers';

export type LoginAs = 'member' | 'volunteer';

/** One login page with two tabs: members (mobile / member ID) and volunteers (mobile / volunteer ID). */
export default function LoginView({ next = '/profile', event = null, as: initialAs = 'member' }: {
  next?: string; event?: { title_en: string; title_kn: string | null } | null; as?: LoginAs;
}) {
  const { t, tr } = useSite();
  const [as, setAs] = useState<LoginAs>(initialAs);
  const vol = as === 'volunteer';
  const router = useRouter();
  const [f, setF] = useState({ id: '', password: '' });
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setErr('');
    const r = await fetch(vol ? '/api/volunteer/login' : '/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) });
    const d = (await r.json().catch(() => ({}))) as { error?: string };
    setBusy(false);
    if (!r.ok) return setErr(d.error || 'Could not log in');
    window.dispatchEvent(new Event('skjv:auth'));
    router.push(next);
    router.refresh();
  }
  const perks: [LucideIcon, string, string][] = vol
    ? [[CalendarCheck2, 'login.volPerk1', 'login.volPerk1s'], [BadgeCheck, 'login.volPerk2', 'login.volPerk2s'], [LayoutList, 'login.volPerk3', 'login.volPerk3s']]
    : [[IdCard, 'login.memPerk1', 'login.memPerk1s'], [CalendarCheck2, 'login.memPerk2', 'login.memPerk2s'], [LayoutList, 'login.memPerk3', 'login.memPerk3s']];

  return (
    <section className={`login-page ${vol ? 'is-vol' : ''}`}>
      <div className="login-bg" aria-hidden="true" />
      <div className="container">
        <div className="login-shell">
          {/* Brand panel: what you get after logging in (changes with the tab) */}
          <aside className="login-brand">
            <div className="login-brand-top">
              <img src="/images/logo.webp" alt="" width={64} height={64} />
              <div>
                <b>{t('org.name1')} {t('org.name2')}</b>
                <small>{t('org.motto')}</small>
              </div>
            </div>
            <h2>{vol ? t('login.welcomeVol') : t('login.welcome')}</h2>
            <p className="login-brand-sub">{t('login.brandSub')}</p>
            <ul className="login-perks">
              {perks.map(([I, k, sub]) => (
                <li key={k}><span><I size={19} /></span><div><b>{t(k)}</b><small>{t(sub)}</small></div></li>
              ))}
            </ul>
            <div className="login-brand-new">
              <p>{t('login.newHere')}</p>
              <div>
                <Link href="/join" className="login-new mem"><IdCard size={16} />{t('login.becomeMember')}</Link>
                <Link href="/join?type=volunteer" className="login-new vol"><HeartHandshake size={16} />{t('login.joinVol')}</Link>
              </div>
            </div>
          </aside>

          {/* Form */}
          <form className="login-card" onSubmit={submit}>
            <div className="login-tabs" role="tablist" aria-label={t('login.title')}>
              <button type="button" role="tab" aria-selected={!vol} className={!vol ? 'on' : ''} onClick={() => { setAs('member'); setErr(''); }}><IdCard size={17} />{t('login.asMember')}</button>
              <button type="button" role="tab" aria-selected={vol} className={vol ? 'on vol' : ''} onClick={() => { setAs('volunteer'); setErr(''); }}><HeartHandshake size={17} />{t('login.asVolunteer')}</button>
            </div>
            <h1>{vol ? t('login.volTitle') : t('login.title')}</h1>
            <p className="login-sub">{vol ? t('login.volSub') : t('login.sub')}</p>
            {event && (
              <div className="login-event-note" role="note">
                <CalendarCheck2 size={22} />
                <div>
                  <b>{t('login.eventNote')} {tr(event, 'title')}</b>
                  <small>{t('login.eventNoteSub')}</small>
                </div>
              </div>
            )}
            <label className="field"><span>{vol ? t('login.volId') : t('login.id')}</span>
              <div className="input-icon"><UserRound size={18} /><input className="input" value={f.id} onChange={(e) => setF({ ...f, id: e.target.value })} autoComplete="username" required placeholder={vol ? '98XXXXXXXX / SKJV-VOL-…' : '98XXXXXXXX / SKJV-…'} /></div>
            </label>
            <label className="field"><span>{t('login.password')}</span>
              <div className="input-icon"><Lock size={18} /><input className="input" type={show ? 'text' : 'password'} value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} autoComplete="current-password" required />
                <button type="button" className="eye" onClick={() => setShow(!show)} aria-label="Show password">{show ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
            </label>
            {err && <p className="form-error">{err}</p>}
            <button className="btn btn-fire btn-lg btn-block login-submit" disabled={busy}>{busy ? <Loader2 className="spin" size={18} /> : null}{t('login.btn')}<ArrowRight size={18} /></button>
            {vol
              ? <p className="auth-alt">{t('login.noVol')} <Link href="/join?type=volunteer">{t('login.joinVol')}</Link></p>
              : <p className="auth-alt">{t('login.noAccount')} <Link href="/join">{t('login.join')}</Link></p>}
            <p className="login-secure"><ShieldCheck size={14} />{t('login.secure')}</p>
          </form>
        </div>
      </div>
    </section>
  );
}
