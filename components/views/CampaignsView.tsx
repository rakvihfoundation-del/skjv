'use client';
import type { Campaign } from '@/lib/types';
import { useState } from 'react';
import { useSite } from '@/components/site/Providers';
import PageHero from '@/components/site/PageHero';
import Reveal from '@/components/site/Reveal';
import { CampaignCard } from '@/components/site/Cards';
import { inr } from '@/lib/utils';

export default function CampaignsView({ campaigns }: { campaigns: Campaign[] }) {
  const { t } = useSite();
  const [tab, setTab] = useState('all');
  const list = campaigns.filter((c) => tab === 'all' || c.status === tab);
  const order = ['upcoming', 'ongoing', 'completed'];
  return (
    <>
      <PageHero title={t('camp.title')} sub={t('camp.sub')} image="/images/gallery/rally-flags.jpg" crumbs={[{ label: t('nav.campaigns') }]} />
      <section className="section">
        <div className="container">
          <Reveal className="camp-summary">
            {order.map((s) => (
              <div key={s}><b>{campaigns.filter((c) => c.status === s).length}</b><span>{t(`camp.${s}`)}</span></div>
            ))}
          </Reveal>
          <div className="tabs center">
            <button className={tab === 'all' ? 'on' : ''} onClick={() => setTab('all')}>{t('common.all')}</button>
            {order.map((s) => <button key={s} className={tab === s ? 'on' : ''} onClick={() => setTab(s)}>{t(`camp.${s}`)} <small>{campaigns.filter((c) => c.status === s).length}</small></button>)}
          </div>
          {list.length === 0 ? <p className="empty">{t('common.noItems')}</p> : (
            <div className="grid-3">
              {list.map((c, i) => <Reveal key={c.id} delay={(i % 3) * 80}><CampaignCard c={c} /></Reveal>)}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
