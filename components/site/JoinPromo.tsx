'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { X, IdCard, HeartHandshake, ArrowRight, Sparkles, AlertTriangle } from 'lucide-react';
import { useSite } from './Providers';

// When it shows (visitors who are not logged in):
//  • pops up in the middle of the screen upon visiting;
//  • closes gracefully when ✕ or backdrop is clicked;
//  • hidden on login/signup pages.
const DISMISS_KEY = 'skjv:join-promo-closed';
const DELAY_MS = 1200;
const HIDDEN_ON = ['/join', '/login', '/profile', '/my-card', '/verify'];

const read = (store: 'local' | 'session', key: string) => {
  try { return (store === 'local' ? localStorage : sessionStorage).getItem(key); } catch { return null; }
};
const write = (store: 'local' | 'session', key: string, value: string) => {
  try { (store === 'local' ? localStorage : sessionStorage).setItem(key, value); } catch { /* ignore */ }
};

/** Centered modal pop-up inviting visitors to become a member, volunteer, or report an issue. */
export default function JoinPromo() {
  const { t, settings, member, volunteer, lang } = useSite();
  const isKn = lang === 'kn';
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
    if (openRef.current) return;
    const id = setTimeout(() => setOpen(true), DELAY_MS);
    return () => clearTimeout(id);
  }, [path, loggedIn, blockedHere]);

  // Handle ESC key to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close(true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  function close(remember: boolean) {
    if (remember) write('session', DISMISS_KEY, '1');
    setLeaving(true);
    setTimeout(() => {
      setOpen(false);
      setLeaving(false);
    }, 280);
  }

  if (!open || loggedIn || blockedHere) return null;

  return (
    <div
      className={`join-promo-backdrop ${leaving ? 'out' : ''}`}
      onClick={() => close(true)}
      role="dialog"
      aria-modal="true"
      aria-label={t('promo.title')}
    >
      <aside
        className={`join-promo-card join-promo-card-wide ${leaving ? 'out' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="join-promo-glow" aria-hidden="true" />

        <header className="join-promo-head">
          <img src="/images/logo.webp" alt="Logo" width={48} height={48} />
          <div>
            <span className="join-promo-eyebrow">
              <Sparkles size={13} /> {t('promo.eyebrow')}
            </span>
            <b>{t('promo.title')}</b>
          </div>
          <button
            type="button"
            className="join-promo-x"
            onClick={() => close(true)}
            aria-label={t('common.close')}
            title={t('common.close')}
          >
            <X size={18} />
          </button>
        </header>

        <p className="join-promo-text">{t('promo.text')}</p>

        {/* Two-column layout: Left side login/member/volunteer, Right side Report an Issue with explanation */}
        <div className="join-promo-split-grid">
          {/* LEFT SIDE: Member / Volunteer / Login */}
          <div className="join-promo-col join-promo-col-left">
            <div className="join-promo-col-head">
              <b>{isKn ? 'ಸದಸ್ಯತ್ವ & ಸ್ವಯಂಸೇವಕರು' : 'Membership & Volunteers'}</b>
              <small>{isKn ? 'ವೇದಿಕೆಗೆ ಅಧಿಕೃತವಾಗಿ ಸೇರ್ಪಡೆಗೊಳ್ಳಿ' : 'Official membership & participation'}</small>
            </div>

            <div className="join-promo-options-col">
              {/* Option 1: Community Member */}
              <Link href="/join" className="join-promo-opt mem" onClick={() => close(false)}>
                <span className="join-promo-icon">
                  <IdCard size={20} />
                </span>
                <span className="join-promo-label">
                  <b>{t('promo.member')}</b>
                  <small>{t('promo.memberSub').replace('{fee}', fee)}</small>
                </span>
                <ArrowRight size={18} className="join-promo-go" />
              </Link>

              {/* Option 2: Volunteer */}
              <Link href="/join?type=volunteer" className="join-promo-opt vol" onClick={() => close(false)}>
                <span className="join-promo-icon">
                  <HeartHandshake size={20} />
                </span>
                <span className="join-promo-label">
                  <b>{t('promo.vol')}</b>
                  <small>{t('promo.volSub')}</small>
                </span>
                <ArrowRight size={18} className="join-promo-go" />
              </Link>
            </div>

            <p className="join-promo-foot-col">
              {t('promo.already')}{' '}
              <Link href="/login" onClick={() => close(false)}>
                <b>{t('promo.login')} →</b>
              </Link>
            </p>
          </div>

          {/* RIGHT SIDE: Report an Issue + Explanation */}
          <div className="join-promo-col join-promo-col-right">
            <div className="join-promo-col-head">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <b>{isKn ? 'ಸಾರ್ವಜನಿಕ ಸಮಸ್ಯೆ ವರದಿ ಮಾಡಿ' : 'Report a Local Issue'}</b>
                <span className="join-promo-open-tag">{isKn ? 'ಮುಕ್ತ ಪೋರ್ಟಲ್' : 'Open to All'}</span>
              </div>
              <small>{isKn ? 'ಯಾರಾದರೂ ಮುಕ್ತವಾಗಿ ವರದಿ ಮಾಡಬಹುದು' : 'No login required · 100% Free'}</small>
            </div>

            <div className="join-promo-issue-box">
              <p className="join-promo-issue-desc">
                {isKn
                  ? 'ನಿಮ್ಮ ಊರು ಅಥವಾ ಬಡಾವಣೆಯ ರಸ್ತೆ, ಕುಡಿಯುವ ನೀರು, ಒಳಚರಂಡಿ, ಶಾಲೆ ಅಥವಾ ಆಸ್ಪತ್ರೆಗಳ ಸಮಸ್ಯೆಗಳಿವೆಯೇ? ಫೋಟೋಗಳು ಅಥವಾ ಪುರಾವೆಗಳೊಂದಿಗೆ ನೇರವಾಗಿ ವರದಿ ಮಾಡಿ — ವೇದಿಕೆ ನಿಮ್ಮ ಧ್ವನಿಯಾಗಿ ಹೋರಾಡಲಿದೆ.'
                  : 'Facing broken roads, drinking water shortage, drainage issues, or civic negligence in your area? Report it publicly with photos or proof — Suvarna Karnataka Janashakti Vedike will stand with you and raise its voice with authorities.'}
              </p>
            </div>

            <Link href="/issues" className="join-promo-opt iss join-promo-report-cta" onClick={() => close(false)}>
              <span className="join-promo-icon">
                <AlertTriangle size={20} />
              </span>
              <span className="join-promo-label">
                <b>{isKn ? 'ಸಮಸ್ಯೆ ವರದಿ ಮಾಡಿ' : 'Report an Issue Now'}</b>
                <small>{isKn ? 'ಫೋಟೋ, ವೀಡಿಯೊ ಅಥವಾ ಪಿಡಿಎಫ್ ಲಗತ್ತಿಸಿ' : 'Upload photos, video or evidence PDF'}</small>
              </span>
              <ArrowRight size={18} className="join-promo-go" />
            </Link>
          </div>
        </div>
      </aside>
    </div>
  );
}
