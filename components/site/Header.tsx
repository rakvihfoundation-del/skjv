'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { HandCoins, Menu, X, Phone, UserRound, IdCard, UserPlus, HeartHandshake, LogIn } from 'lucide-react';
import { useSite } from './Providers';
import { InstagramIcon, FacebookIcon, YoutubeIcon, XIcon, type IconProps } from './Icons';

export const NAV: { href: string; key: string }[] = [
  { href: '/', key: 'nav.home' },
  { href: '/leaders', key: 'nav.leaders' },
  { href: '/news', key: 'nav.news' },
  { href: '/campaigns', key: 'nav.campaigns' },
  { href: '/gallery', key: 'nav.gallery' },
  { href: '/about', key: 'nav.about' },
];

export function LangToggle({ className = '' }: { className?: string }) {
  const { lang, setLang, t } = useSite();
  const kn = lang === 'kn';
  return (
    <button
      type="button"
      className={`lang-coin ${kn ? 'is-kn' : ''} ${className}`}
      onClick={() => setLang(kn ? 'en' : 'kn')}
      aria-label={kn ? 'Switch to English' : 'ಕನ್ನಡಕ್ಕೆ ಬದಲಿಸಿ'}
      title={kn ? 'Switch to English' : 'ಕನ್ನಡಕ್ಕೆ ಬದಲಿಸಿ'}
    >
      <span className="coin" aria-hidden="true">
        <span className="coin-face front">A</span>
        <span className="coin-face back">ಅ</span>
      </span>
      <span className="lang-coin-text">
        <b className={kn ? '' : 'kn-font'}>{kn ? 'English' : 'ಕನ್ನಡ'}</b>
      </span>
      <span className="lang-coin-swap" aria-hidden="true">⇄</span>
    </button>
  );
}

export function Socials({ className = '' }: { className?: string }) {
  const { settings: s } = useSite();
  const all: [string | undefined, (p: IconProps) => React.JSX.Element, string][] = [
    [s.instagram_url, InstagramIcon, 'Instagram'], [s.x_url, XIcon, 'X'],
    [s.facebook_url, FacebookIcon, 'Facebook'], [s.youtube_url, YoutubeIcon, 'YouTube'],
  ];
  const items = all.filter(([u]) => u);
  return (
    <div className={`socials ${className}`}>
      {items.map(([u, I, label]) => (
        <a key={label} href={u} target="_blank" rel="noopener noreferrer" aria-label={label}><I size={15} /></a>
      ))}
    </div>
  );
}

export default function Header() {
  const { t, settings, member, volunteer } = useSite();
  const loggedIn = !!(member || volunteer);
  const path = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  useEffect(() => { setOpen(false); }, [path]);
  useEffect(() => { document.body.style.overflow = open ? 'hidden' : ''; }, [open]);

  const isActive = (href: string) => (href === '/' ? path === '/' : path.startsWith(href));
  const slogans = [t('top.slogan1'), t('top.slogan2'), t('top.slogan3')];

  return (
    <>
      <div className="topbar">
        <div className="container topbar-inner">
          <a className="topbar-phone" href={`tel:${(settings.phone || '').replace(/\s/g, '')}`}><Phone size={13} />{settings.phone}</a>
          <div className="topbar-marquee" aria-hidden="true">
            <div className="marquee-track">
              {[...slogans, ...slogans].map((s, i) => <span key={i}>✦ {s}</span>)}
            </div>
          </div>
          <Socials />
        </div>
      </div>

      <header className={`site-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="container header-inner">
          <Link href="/" className="brand" aria-label={t('org.name')}>
            <span className="brand-logo"><img src="/images/logo.webp" alt="" width="56" height="56" /></span>
            <span className="brand-text">
              <b><span>{t('org.name1')}</span> <span>{t('org.name2')}</span></b>
              <small>{t('org.motto')}</small>
            </span>
          </Link>

          <nav className="main-nav" aria-label="Main">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className={isActive(n.href) ? 'active' : ''}>{t(n.key)}</Link>
            ))}
          </nav>

          <div className="header-actions">
            <LangToggle />
            {member && (
              <Link href="/my-card" className={`icon-btn ${isActive('/my-card') ? 'on' : ''}`} title={t('nav.mycard')} aria-label={t('nav.mycard')}><IdCard size={18} /></Link>
            )}
            <Link href="/donate" className="btn btn-gold btn-sm hide-sm"><HandCoins size={17} />{t('nav.donate')}</Link>
            {/* One login for everyone: the login page has Member / Volunteer tabs */}
            {!loggedIn && (
              <Link href="/login" className={`btn btn-ghost btn-sm hide-sm header-login ${isActive('/login') ? 'is-current' : ''}`}><LogIn size={16} />{t('nav.loginShort')}</Link>
            )}
            <Link href={loggedIn ? '/profile' : '/join'} className={`btn btn-fire btn-sm hide-sm ${isActive('/profile') ? 'is-current' : ''}`}>
              {volunteer && !member ? <HeartHandshake size={16} /> : loggedIn ? <UserRound size={16} /> : <UserPlus size={16} />}
              {loggedIn
                ? <><span className="lbl-full">{t('nav.profile')}</span><span className="lbl-short">{t('nav.profileShort')}</span></>
                : t('nav.signup')}
            </Link>
            <button className="burger" onClick={() => setOpen(true)} aria-label={t('nav.menu')}><Menu size={22} /></button>
          </div>
        </div>
      </header>


      <div className={`drawer ${open ? 'open' : ''}`} aria-hidden={!open}>
        <div className="drawer-backdrop" onClick={() => setOpen(false)} />
        <aside className="drawer-panel">
          <div className="drawer-top">
            <span className="brand-logo"><img src="/images/logo.webp" alt="" /></span>
            <button className="drawer-close" onClick={() => setOpen(false)} aria-label={t('common.close')}><X size={22} /></button>
          </div>
          <nav className="drawer-nav">
            {NAV.map((n, i) => (
              <Link key={n.href} href={n.href} className={isActive(n.href) ? 'active' : ''} style={{ transitionDelay: `${80 + i * 40}ms` }}>
                {t(n.key)}
              </Link>
            ))}
          </nav>
          <div className="drawer-actions">
            {loggedIn ? (
              <>
                <Link href="/profile" className="btn btn-fire btn-block">{member ? <UserRound size={18} /> : <HeartHandshake size={18} />}{t('nav.profile')}</Link>
                {member && <Link href="/my-card" className="btn btn-ghost-light btn-block"><IdCard size={18} />{t('nav.mycard')}</Link>}
              </>
            ) : (
              <Link href="/join" className="btn btn-fire btn-block"><UserPlus size={18} />{t('nav.signup')}</Link>
            )}
            <Link href="/donate" className="btn btn-gold btn-block"><HandCoins size={19} />{t('nav.donate')}</Link>
            {!loggedIn && <Link href="/login" className="btn btn-ghost-light btn-block"><LogIn size={18} />{t('nav.loginShort')}</Link>}
            <LangToggle className="light" />
          </div>
        </aside>
      </div>
    </>
  );
}
