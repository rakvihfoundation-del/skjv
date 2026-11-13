'use client';
import type { Campaign, RegistrationInfo } from '@/lib/types';
import { CalendarDays, Clock, MapPin, CalendarPlus } from 'lucide-react';
import EventRegister from '@/components/site/EventRegister';
import Countdown from '@/components/site/Countdown';
import { calLink } from '@/components/site/EventModal';
import { useSite } from '@/components/site/Providers';
import PageHero from '@/components/site/PageHero';
import SectionHead from '@/components/site/SectionHead';
import { CampaignCard } from '@/components/site/Cards';
import { Body, ShareBar } from './NewsDetailView';
import { fmtDate, parseDate, photosOf } from '@/lib/utils';
import MediaSlider from '@/components/site/MediaSlider';

export default function CampaignDetailView({ c, others, registration }: { c: Campaign; others: Campaign[]; registration: RegistrationInfo }) {
  const { t, tr, lang } = useSite();
  return (
    <>
      <PageHero title={tr(c, 'title')} sub={tr(c, 'summary')} image={c.image || '/images/banner-red.jpg'} crumbs={[{ label: t('nav.campaigns'), href: '/campaigns' }, { label: t(`camp.${c.status}`) }]} />
      <section className="section">
        <div className="container detail-grid">
          <div>
            <MediaSlider photos={photosOf(c)} alt={tr(c, 'title')} />
            <Body text={tr(c, 'body')} />
            <ShareBar title={tr(c, 'title')} />
          </div>
          <aside className="detail-aside">
            <div className="fund-box">
              <span className={`chip status-${c.status}`}>{t(`camp.${c.status}`)}</span>
              <div className="evm-facts one">
                <div><CalendarDays size={18} /><span><small>{t('camp.when')}</small><b>{fmtDate(c.start_date, lang)}{c.end_date && c.end_date !== c.start_date ? ` – ${fmtDate(c.end_date, lang)}` : ''}</b></span></div>
                {c.time && <div><Clock size={18} /><span><small>{t('camp.time')}</small><b>{c.time}</b></span></div>}
                {tr(c, 'venue') && <div><MapPin size={18} /><span><small>{t('camp.where')}</small><b>{tr(c, 'venue')}</b></span></div>}
              </div>
              {c.status === 'upcoming' && (parseDate(c.start_date)?.getTime() || 0) > Date.now() && <Countdown date={c.start_date} />}
              <EventRegister c={c} initial={registration} />
              {c.status !== 'completed' && (
                <a className="btn btn-ghost btn-block" href={calLink(c, tr(c, 'title'), tr(c, 'venue'))} target="_blank" rel="noopener noreferrer"><CalendarPlus size={18} />{t('events.addCal')}</a>
              )}
            </div>
          </aside>
        </div>
      </section>
      {others.length > 0 && (
        <section className="section tinted">
          <div className="container">
            <SectionHead title={t('camp.title')} />
            <div className="grid-3">{others.map((o) => <CampaignCard key={o.id} c={o} />)}</div>
          </div>
        </section>
      )}
    </>
  );
}
