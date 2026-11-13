'use client';
import type { Leader } from '@/lib/types';
import Link from 'next/link';
import { useState } from 'react';
import { Quote, ArrowRight, MapPin } from 'lucide-react';
import { useSite } from '@/components/site/Providers';
import PageHero from '@/components/site/PageHero';
import SectionHead from '@/components/site/SectionHead';
import Reveal from '@/components/site/Reveal';
import { LeaderCard, Avatar } from '@/components/site/Cards';
import { placeLabel } from '@/lib/utils';

const TIERS = ['state', 'district', 'taluk'];

export default function LeadersView({ leaders }: { leaders: Leader[] }) {
  const { t, tr, lang, member } = useSite();
  const [tab, setTab] = useState('all');
  const founders = leaders.filter((l) => l.tier === 'founder');
  const rest = leaders.filter((l) => l.tier !== 'founder');
  const tiers = TIERS.filter((tier) => rest.some((l) => l.tier === tier));
  const shown = tab === 'all' ? tiers : [tab];

  return (
    <>
      <PageHero title={t('leaders.title')} sub={t('leaders.sub')} image="/images/gallery/rally-crowd.jpg" crumbs={[{ label: t('nav.leaders') }]} />

      {founders.map((f, i) => (
        <section key={f.id} className={`section founder-spot ${i % 2 ? 'alt' : ''}`}>
          <div className="container founder-spot-grid">
            <Reveal className="spot-photo">
              <div className="arch"><Avatar src={f.photo} name={f.name_en} /></div>
            </Reveal>
            <Reveal className="spot-copy" delay={100}>
              <span className="eyebrow"><i />{t('leaders.founder')}</span>
              <h2 className="display">{tr(f, 'name')}</h2>
              <p className="spot-role">{tr(f, 'role')}{f.district && <><span>•</span><MapPin size={15} />{placeLabel(f.district, lang)}</>}</p>
              {tr(f, 'quote') && (
                <blockquote className={`spot-quote ${lang === 'kn' ? 'kn-font' : ''}`}><Quote size={28} />{tr(f, 'quote')}</blockquote>
              )}
              <p className="lead">{tr(f, 'bio')}</p>
            </Reveal>
          </div>
        </section>
      ))}

      <section className="section leaders-list">
        <div className="container">
          <div className="tabs center">
            <button className={tab === 'all' ? 'on' : ''} onClick={() => setTab('all')}>{t('common.all')}</button>
            {tiers.map((tier) => (
              <button key={tier} className={tab === tier ? 'on' : ''} onClick={() => setTab(tier)}>{t(`leaders.${tier}`)}</button>
            ))}
          </div>
          {shown.map((tier) => (
            <div key={tier} className="tier-block">
              <SectionHead title={t(`leaders.${tier}`)} />
              <div className="leaders-grid">
                {rest.filter((l) => l.tier === tier).map((l, i) => (
                  <Reveal key={l.id} delay={(i % 4) * 70}><LeaderCard l={l} /></Reveal>
                ))}
              </div>
            </div>
          ))}
          {!member && (
          <Reveal className="cta-strip">
            <div>
              <h3>{t('leaders.ctaTitle')}</h3>
              <p>{t('leaders.ctaText')}</p>
            </div>
            <Link href="/join" className="btn btn-gold btn-lg">{t('nav.signup')}<ArrowRight size={18} /></Link>
          </Reveal>
          )}
        </div>
      </section>
    </>
  );
}
