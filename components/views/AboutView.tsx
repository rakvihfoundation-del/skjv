'use client';
import type { ChangeEvent, FormEvent } from 'react';
import type { LucideIcon } from 'lucide-react';
import type { Leader } from '@/lib/types';
import { useState } from 'react';
import { Eye, Target, Users, Megaphone, HandHeart, MapPin, Phone, Mail, Send, CheckCircle2, Loader2 } from 'lucide-react';
import { useSite } from '@/components/site/Providers';
import PageHero from '@/components/site/PageHero';
import SectionHead from '@/components/site/SectionHead';
import Reveal from '@/components/site/Reveal';
import { Avatar } from '@/components/site/Cards';
import { PILLARS } from './HomeView';
import BannerStrip from '@/components/site/BannerStrip';

const JOURNEY = {
  en: [
    ['Founded', 'A small group of volunteers comes together with one dream — a golden Karnataka.'],
    ['District units', 'Units formed across districts; first statewide Rajyotsava celebrations.'],
    ['Seva programmes', 'Health camps, scholarships and environment drives become regular programmes.'],
    ['Statewide movement', 'Thousands of members in 31 districts; digital membership with QR ID cards.'],
  ],
  kn: [
    ['ಸ್ಥಾಪನೆ', 'ಸುವರ್ಣ ಕರ್ನಾಟಕದ ಕನಸಿನೊಂದಿಗೆ ಕೆಲವು ಸ್ವಯಂಸೇವಕರು ಒಂದಾದರು.'],
    ['ಜಿಲ್ಲಾ ಘಟಕಗಳು', 'ಜಿಲ್ಲೆಗಳಲ್ಲಿ ಘಟಕಗಳ ರಚನೆ; ಮೊದಲ ರಾಜ್ಯವ್ಯಾಪಿ ರಾಜ್ಯೋತ್ಸವ ಆಚರಣೆ.'],
    ['ಸೇವಾ ಕಾರ್ಯಕ್ರಮಗಳು', 'ಆರೋಗ್ಯ ಶಿಬಿರ, ವಿದ್ಯಾರ್ಥಿವೇತನ ಮತ್ತು ಪರಿಸರ ಅಭಿಯಾನಗಳು ನಿಯಮಿತ ಕಾರ್ಯಕ್ರಮಗಳಾದವು.'],
    ['ರಾಜ್ಯವ್ಯಾಪಿ ಆಂದೋಲನ', '31 ಜಿಲ್ಲೆಗಳಲ್ಲಿ ಸಾವಿರಾರು ಸದಸ್ಯರು; QR ಗುರುತಿನ ಚೀಟಿಯೊಂದಿಗೆ ಡಿಜಿಟಲ್ ಸದಸ್ಯತ್ವ.'],
  ],
};

function ContactForm() {
  const { t } = useSite();
  const [f, setF] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [state, setState] = useState({ busy: false, done: false, error: '' });
  const set = (k: keyof typeof f) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });
  async function submit(e: FormEvent) {
    e.preventDefault();
    setState({ busy: true, done: false, error: '' });
    const r = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) });
    const d = await r.json();
    if (!r.ok) return setState({ busy: false, done: false, error: d.error });
    setState({ busy: false, done: true, error: '' });
    setF({ name: '', email: '', phone: '', subject: '', message: '' });
  }
  if (state.done) return <div className="success-panel"><CheckCircle2 size={44} /><p>{t('about.sent')}</p></div>;
  return (
    <form className="form-grid" onSubmit={submit}>
      <label className="field"><span>{t('about.formName')}</span><input className="input" required value={f.name} onChange={set('name')} /></label>
      <label className="field"><span>{t('about.formPhone')}</span><input className="input" inputMode="tel" value={f.phone} onChange={set('phone')} /></label>
      <label className="field full"><span>{t('about.formEmail')}</span><input className="input" type="email" value={f.email} onChange={set('email')} /></label>
      <label className="field full"><span>{t('about.formSubject')}</span><input className="input" value={f.subject} onChange={set('subject')} /></label>
      <label className="field full"><span>{t('about.formMsg')}</span><textarea className="input" rows={5} required value={f.message} onChange={set('message')} /></label>
      {state.error && <p className="form-error full">{state.error}</p>}
      <button className="btn btn-fire btn-lg full" disabled={state.busy}>{state.busy ? <Loader2 className="spin" size={18} /> : <Send size={18} />}{t('about.send')}</button>
    </form>
  );
}

export default function AboutView({ founders }: { founders: Leader[] }) {
  const { t, tr, lang, settings: s } = useSite();
  return (
    <div className="about-page">
      <PageHero title={t('about.title')} sub={t('about.sub')} image="/images/gallery/vidhana-soudha.jpg" crumbs={[{ label: t('nav.about') }]} />

      <section className="section">
        <div className="container about-story">
          <Reveal className="story-media">
            <img src="/images/poster.jpg" alt="" />
            <div className="story-stamp"><img src="/images/logo.webp" alt="" /></div>
          </Reveal>
          <div>
            <Reveal><span className="eyebrow"><i />{t('about.storyEyebrow')}</span></Reveal>
            <Reveal as="h2" className="display" delay={60}>{t('about.storyTitle')}</Reveal>
            <Reveal as="p" className="lead" delay={120}>{t('about.story1')}</Reveal>
            <Reveal as="p" delay={160}>{t('about.story2')}</Reveal>
            <div className="vm-grid">
              <Reveal className="vm-card" delay={200}><Eye size={26} /><h3>{t('about.vision')}</h3><p>{t('about.visionText')}</p></Reveal>
              <Reveal className="vm-card red" delay={260}><Target size={26} /><h3>{t('about.mission')}</h3><p>{t('about.missionText')}</p></Reveal>
            </div>
          </div>
        </div>
      </section>

      <section className="section values-sec">
        <div className="container">
          <SectionHead light eyebrow={t('about.valuesEyebrow')} title={t('about.valuesTitle')} />
          <div className="values">
            {([[1, Users], [2, Megaphone], [3, HandHeart]] as [number, LucideIcon][]).map(([n, I], i) => (
              <Reveal key={n} className="value" delay={i * 100}>
                <span className="value-num">0{n}</span>
                <I size={34} />
                <h3>{t(`about.v${n}`)}</h3>
                <small>{t(`about.v${n}t`)}</small>
                <p>{t(`about.v${n}d`)}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHead eyebrow={t('home.pillarsEyebrow')} title={t('home.pillarsTitle')} />
          <div className="works-grid">
            <Reveal className="works-img"><img loading="lazy" decoding="async" src="/images/our-works.jpg" alt={t('home.pillarsTitle')} /></Reveal>
            <div className="works-list">
              {PILLARS.map(([k, I], i) => (
                <Reveal key={k} className="works-item" delay={i * 60}>
                  <span className="pillar-icon sm"><I size={20} /></span>
                  <div><h4>{t(`pillar.${k}`)}</h4><p>{t(`pillar.${k}.d`)}</p></div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <BannerStrip src="/images/banner-strip-white.jpg" alt={`${t('org.name')} — ${t('org.tagline')}`} variant="white" />

      <section className="section tinted">
        <div className="container">
          <SectionHead eyebrow={t('about.journeyEyebrow')} title={t('about.journeyTitle')} />
          <div className="journey">
            {JOURNEY[lang].map(([h, p], i) => (
              <Reveal key={h} className="journey-step" delay={i * 100}>
                <span className="journey-dot">{i + 1}</span>
                <h4>{h}</h4>
                <p>{p}</p>
              </Reveal>
            ))}
          </div>
          {founders[0] && (
            <Reveal className="about-founder">
              <Avatar src={founders[0].photo} name={founders[0].name_en} />
              <div>
                <p className={lang === 'kn' ? 'kn-font' : ''}>“{tr(founders[0], 'quote')}”</p>
                <b>{tr(founders[0], 'name')}</b><small>{tr(founders[0], 'role')}</small>
              </div>
            </Reveal>
          )}
        </div>
      </section>

      <section className="section" id="contact">
        <div className="container">
          <SectionHead eyebrow={t('about.contactEyebrow')} title={t('about.contactTitle')} />
          <div className="contact-grid">
            <div className="contact-cards">
              <Reveal className="contact-card"><MapPin size={22} /><div><small>{t('about.officeAddr')}</small><p>{lang === 'kn' ? s.address_kn : s.address_en}</p></div></Reveal>
              {s.phone && <Reveal className="contact-card" delay={60}><Phone size={22} /><div><small>{t('about.callUs')}</small><a href={`tel:${s.phone.replace(/\s/g, '')}`}>{s.phone}</a></div></Reveal>}
              {s.email && <Reveal className="contact-card" delay={120}><Mail size={22} /><div><small>{t('about.emailUs')}</small><a href={`mailto:${s.email}`}>{s.email}</a></div></Reveal>}
              {s.map_embed && <div className="map"><iframe src={s.map_embed} loading="lazy" title="Map" referrerPolicy="no-referrer-when-downgrade" /></div>}
            </div>
            <Reveal className="card-panel"><ContactForm /></Reveal>
          </div>
        </div>
      </section>
    </div>
  );
}
