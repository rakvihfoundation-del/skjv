'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarCheck2, CheckCircle2, Loader2, LogIn, UserPlus, Users, Lock, ShieldAlert, CalendarDays, Clock, MapPin, HeartHandshake } from 'lucide-react';
import { useDialog } from './Dialog';
import { useSite } from './Providers';
import { fmtDate } from '@/lib/utils';
import type { Campaign, RegistrationInfo } from '@/lib/types';

/**
 * Event registration for logged-in members and volunteers (free for both). They confirm in a pop-up first;
 * once registered it cannot be cancelled online (the office can remove it from the admin panel).
 */
export default function EventRegister({ c, initial }: { c: Campaign; initial: RegistrationInfo }) {
  const { t, tr, lang, member: m, volunteer } = useSite();
  const member = m ?? volunteer; // whoever is logged in
  const { ask, notify } = useDialog();
  const router = useRouter();
  const [reg, setReg] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const when = `${fmtDate(c.start_date, lang)}${c.end_date && c.end_date !== c.start_date ? ` – ${fmtDate(c.end_date, lang)}` : ''}`;

  async function register() {
    const summary = tr(c, 'summary');
    const yes = await ask({
      tone: 'primary',
      icon: CalendarCheck2,
      title: t('ev.askTitle'),
      message: (
        <div className="dlg-event">
          <b className="dlg-event-title">{tr(c, 'title')}</b>
          {summary && <p>{summary}</p>}
          <ul>
            <li><CalendarDays size={15} />{when}</li>
            {c.time && <li><Clock size={15} />{c.time}</li>}
            {tr(c, 'venue') && <li><MapPin size={15} />{tr(c, 'venue')}</li>}
          </ul>
          <p className="dlg-event-q">{t('ev.askQ')}</p>
        </div>
      ),
      confirmText: t('ev.askYes'),
      cancelText: t('ev.askNo'),
      note: t('ev.disclaimer'),
    });
    if (!yes) return;

    setBusy(true); setErr('');
    try {
      const r = await fetch(`/api/events/${c.id}/register`, { method: 'POST' });
      const d = (await r.json().catch(() => ({}))) as Partial<RegistrationInfo> & { error?: string };
      if (!r.ok) throw new Error(d.error || 'Something went wrong');
      setReg({ registered: true, count: d.count ?? reg.count + 1 });
      notify(t('ev.doneRegister'));
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setErr(msg);
      notify(msg, 'error');
    } finally {
      setBusy(false);
    }
  }

  const count = reg.count > 0 && (
    <p className="ev-count"><Users size={16} />{t(reg.count === 1 ? 'ev.count1' : 'ev.count').replace('{n}', reg.count.toLocaleString('en-IN'))}</p>
  );

  if (c.status === 'completed') {
    return (
      <div className="ev-box muted">
        {reg.registered ? <CheckCircle2 size={20} /> : <Lock size={20} />}
        <p>{reg.registered ? t('ev.attended') : t('ev.ended')}</p>
        {count}
      </div>
    );
  }

  if (!member) {
    return (
      <div className="ev-box">
        <p className="ev-note">{t('ev.membersOnly')}</p>
        <button
          type="button" className="btn btn-fire btn-block btn-lg"
          onClick={() => {
            // Tell the visitor why they are being taken to the login page.
            notify(t('ev.loginNotice'), 'info');
            router.push(`/login?next=${encodeURIComponent(`/campaigns/${c.slug}`)}&event=${encodeURIComponent(c.slug)}`);
          }}
        ><LogIn size={18} />{t('ev.loginToRegister')}</button>
        <p className="ev-alt">{t('ev.notMember')} <Link href="/join"><UserPlus size={15} />{t('hero.dockJoin')}</Link> {t('ev.or')} <Link href="/join?type=volunteer"><HeartHandshake size={15} />{t('ev.volFree')}</Link></p>
        {count}
      </div>
    );
  }

  if (member.status === 'suspended') {
    return <div className="ev-box muted"><ShieldAlert size={20} /><p>{t('ev.suspended')}</p></div>;
  }

  if (reg.registered) {
    return (
      <div className="ev-box">
        <div className="member-note">
          <CheckCircle2 size={22} />
          <div><b>{t('ev.registered')}</b><small>{t('ev.registeredText')}</small></div>
        </div>
        <p className="ev-note center">{t('ev.noCancel')}</p>
        {count}
      </div>
    );
  }

  return (
    <div className="ev-box">
      <button type="button" className="btn btn-fire btn-block btn-lg" onClick={register} disabled={busy}>
        {busy ? <Loader2 className="spin" size={18} /> : <CalendarCheck2 size={18} />}{t('ev.register')}
      </button>
      <p className="ev-note center">{t('ev.registerAs').replace('{name}', member.name.split(' ')[0])}</p>
      {err && <p className="form-error">{err}</p>}
      {count}
    </div>
  );
}
