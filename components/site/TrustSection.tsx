'use client';
import Link from 'next/link';
import { HeartHandshake, Home, UtensilsCrossed, Stethoscope, Heart, Phone, MapPin } from 'lucide-react';
import { useSite } from './Providers';
import Reveal from './Reveal';

/** Home page: Ammana Neralu Foundation (old age home). Text, photo and contact come from Admin → Settings. */
export default function TrustSection() {
  const { t, lang, settings: s } = useSite();
  const pick = (en?: string, kn?: string) => (lang === 'kn' ? kn || en : en || kn) || '';
  const name = pick(s.trust_name_en, s.trust_name_kn) || t('trust.name');
  const tagline = pick(s.trust_tagline_en, s.trust_tagline_kn) || t('trust.tagline');
  const about = pick(s.trust_about_en, s.trust_about_kn) || t('trust.about');
  const image = s.trust_image || '/images/trust/old-age-home.jpg';
  const pillars: [typeof Home, string][] = [[Home, 'trust.p1'], [UtensilsCrossed, 'trust.p2'], [Stethoscope, 'trust.p3'], [Heart, 'trust.p4']];

  return (
    <section className="section trust-sec" id="ammana-neralu">
      <div className="container trust-grid">
        <Reveal className="trust-media">
          <img src={image} alt={`${name} — ${tagline}`} loading="lazy" decoding="async" />
          <span className="trust-seal"><HeartHandshake size={22} /><b className="kn-font">ಅಮ್ಮನ ನೆರಳು</b></span>
        </Reveal>
        <Reveal className="trust-copy" delay={120}>
          <span className="eyebrow"><i />{t('trust.eyebrow')}</span>
          <h2 className="section-title">{name}</h2>
          {tagline && <span className="trust-tag"><Home size={16} />{tagline}</span>}
          {about && <p className="trust-about">{about}</p>}
          <ul className="trust-pillars">
            {pillars.map(([I, k]) => <li key={k}><span><I size={18} /></span>{t(k)}</li>)}
          </ul>
          <div className="trust-actions">
            <Link href="/donate" className="btn btn-fire btn-lg"><Heart size={18} />{t('trust.support')}</Link>
            {s.trust_phone && <a href={`tel:${s.trust_phone.replace(/\s/g, '')}`} className="btn btn-ghost btn-lg"><Phone size={18} />{t('trust.call')}</a>}
          </div>
          {s.trust_address && <p className="trust-address"><MapPin size={16} />{s.trust_address}</p>}
        </Reveal>
      </div>
    </section>
  );
}
