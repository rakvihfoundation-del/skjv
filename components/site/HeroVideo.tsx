'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Pause, Play, ArrowRight, UserPlus, ChevronDown } from 'lucide-react';
import { useSite } from './Providers';

export default function HeroVideo() {
  const { t, settings, lang, member } = useSite();
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(true);
  const fee = Number(settings.membership_fee || 1500).toLocaleString('en-IN');

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { v.pause(); setPlaying(false); return; }
    v.play().catch(() => setPlaying(false));
  }, []);

  function toggle() {
    const v = ref.current;
    if (!v) return;
    if (v.paused) { void v.play(); setPlaying(true); } else { v.pause(); setPlaying(false); }
  }

  return (
    <section className="vhero">
      <video ref={ref} className="vhero-video" muted loop playsInline autoPlay preload="auto" poster="/video/hero-poster.jpg?v=2" aria-hidden="true">
        <source src="/video/hero-mobile.mp4?v=2" type="video/mp4" media="(max-width: 760px)" />
        <source src="/video/hero.mp4?v=2" type="video/mp4" />
      </video>
      <div className="vhero-shade" />

      <div className="container vhero-inner">
        <div className="vhero-copy">
          <span className="vhero-eyebrow"><i />{t('org.motto')}</span>
          <h1 className={`vhero-title ${lang}`}><span className="l1">{t('org.name1')}</span> <span className="l2">{t('org.name2')}</span></h1>
          <p className="vhero-sub">{t('hero.sub')}</p>
          <div className="vhero-cta">
            {!member && <Link href="/join" className="btn btn-gold btn-lg"><UserPlus size={19} />{t('hero.dockJoin')} · ₹{fee}</Link>}
            <Link href="/about" className="btn btn-ghost-light btn-lg">{t('hero.explore')}<ArrowRight size={19} /></Link>
          </div>
        </div>
      </div>

      <button className="vhero-play" onClick={toggle} aria-label={playing ? t('hero.pause') : t('hero.play')}>
        {playing ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
      </button>
      <a href="#welcome" className="vhero-scroll" aria-label={t('hero.scroll')}><span>{t('hero.scroll')}</span><ChevronDown size={18} /></a>
      <div className="vhero-flag"><i /><i /></div>
    </section>
  );
}
