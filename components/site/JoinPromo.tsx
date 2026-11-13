'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { X, IdCard, HeartHandshake, ArrowRight, Sparkles } from 'lucide-react';
import { useSite } from './Providers';

// When it shows (visitors who are not logged in):
//  • every page, until the visitor closes it with ✕ (then it stays closed on other pages for this visit);
//  • the HOME page always, every time they arrive there — even after ✕.
const DISMISS_KEY = 'skjv:join-promo-closed'; // set by ✕ for the rest of this browser visit
const DELAY_MS = 1500;
const HIDDEN_ON = ['/join', '/login', '/profile', '/my-card', '/verify'];

const read = (store: 'local' | 'session', key: string) => {
  try { return (store === 'local' ? localStorage : sessionStorage).getItem(key); } catch { return null; }
};
const write = (store: 'local' | 'session', key: string, value: string) => {
  try { (store === 'local' ? localStorage : sessionStorage).setItem(key, value); } catch { /* storage blocked: just don't remember */ }
};

/** Corner pop-up inviting visitors to join as a community member or a volunteer. */
export default function JoinPromo() {
  const { t, settings, member, volunteer } = useSite();
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const fee = Number(settings.membership_fee || 1500).toLocaleString('en-IN');
  const blockedHere = HIDDEN_ON.some((p) => path === p || path.startsWith(`${p}/`));
  const loggedIn = !!(member || volunteer);

  const openRef = useRef(false);
  openRef.current = open;

  useEffect(() => {
    if (loggedIn || blockedHere) { setOpen(false); return; }
    const onHome = path === '/';
    if (!onHome && read('session', DISMISS_KEY)) { setOpen(false); return; }
    if (openRef.current) return; // already showing: stay put while the visitor browses (no flicker)
    const id = setTimeout(() => setOpen(true), DELAY_MS);
    return () => clearTimeout(id);
  }, [path, loggedIn, blockedHere]);

  function close(remember: boolean) {
    if (remember) write('session', DISMISS_KEY, '1');
    setLeaving(true);
    setTimeout(() => { setOpen(false); setLeaving(false); }, 260);
  }

  if (!open || loggedIn || blockedHere) return null;

  return (
    <aside className={`join-promo ${leaving ? 'out' : ''}`} role="dialog" aria-label={t('promo.title')}>
      <div className="join-promo-glow" aria-hidden="true" />
      <header className="join-promo-head">
        <img src="/images/logo.webp" alt="" width={40} height={40} />
        <div>
          <span className="join-promo-eyebrow"><Sparkles size={13} />{t('promo.eyebrow')}</span>
          <b>{t('promo.title')}</b>
        </div>
        <button type="button" className="join-promo-x" onClick={() => close(true)} aria-label={t('common.close')}><X size={17} /></button>
      </header>
      <p className="join-promo-text">{t('promo.text')}</p>
      <div className="join-promo-options">
        <Link href="/join" className="join-promo-opt mem" onClick={() => close(false)}>
          <span className="join-promo-icon"><IdCard size={20} /></span>
          <span className="join-promo-label"><b>{t('promo.member')}</b><small>{t('promo.memberSub').replace('{fee}', fee)}</small></span>
          <ArrowRight size={18} className="join-promo-go" />
        </Link>
        <Link href="/join?type=volunteer" className="join-promo-opt vol" onClick={() => close(false)}>
          <span className="join-promo-icon"><HeartHandshake size={20} /></span>
          <span className="join-promo-label"><b>{t('promo.vol')}</b><small>{t('promo.volSub')}</small></span>
          <ArrowRight size={18} className="join-promo-go" />
        </Link>
      </div>
      <p className="join-promo-foot">{t('promo.already')} <Link href="/login" onClick={() => close(false)}>{t('promo.login')}</Link></p>
    </aside>
  );
}
