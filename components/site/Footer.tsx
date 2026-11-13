'use client';
import Link from 'next/link';
import { MapPin, Phone, Mail } from 'lucide-react';
import { useSite } from './Providers';
import { NAV, Socials } from './Header';
import { Flourish } from './Ornaments';

export default function Footer() {
  const { t, lang, settings: s, member: m, volunteer } = useSite();
  const member = m ?? volunteer;
  return (
    <footer className="site-footer">
      <div className="footer-flag"><i /><i /></div>
      <div className="container footer-grid">
        <div className="footer-brand">
          <div className="footer-logo-row">
            <span className="brand-logo lg"><img loading="lazy" decoding="async" src="/images/logo.webp" alt="" /></span>
            <div>
              <b>{t('org.name1')}<br />{t('org.name2')}</b>
              <small>{t('org.motto')}</small>
            </div>
          </div>
          <p>{t('footer.about')}</p>
          <p className="footer-motto">{t('org.tagline')}</p>
          <Socials className="footer-socials" />
        </div>
        <div>
          <h4>{t('footer.quick')}</h4>
          <ul>
            {NAV.map((n) => (
              <li key={n.href}><Link href={n.href}>{t(n.key)}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h4>{t('footer.get')}</h4>
          <ul>
            {!member && <li><Link href="/join">{t('nav.signup')}</Link></li>}
            <li><Link href="/donate">{t('nav.donate')}</Link></li>
            {!member && <li><Link href="/login">{t('nav.login')}</Link></li>}
            <li><Link href="/terms">{t('footer.terms')}</Link></li>
          </ul>
        </div>
        <div>
          <h4>{t('footer.contact')}</h4>
          <ul className="footer-contact">
            <li><MapPin size={16} /><span>{lang === 'kn' ? s.address_kn : s.address_en}</span></li>
            {s.phone && <li><Phone size={16} /><a href={`tel:${s.phone.replace(/\s/g, '')}`}>{s.phone}</a></li>}
            {s.email && <li><Mail size={16} /><a href={`mailto:${s.email}`}>{s.email}</a></li>}
          </ul>
        </div>
      </div>
      <div className="container footer-bottom">
        <Flourish width={110} />
        <p>© {new Date().getFullYear()} {t('org.name')}. {t('footer.rights')}</p>
        <p className="made">{t('footer.credit')} <a className="rakvih" href="https://www.rakvih.in" target="_blank" rel="noopener noreferrer">Rakvih</a></p>
      </div>
    </footer>
  );
}
