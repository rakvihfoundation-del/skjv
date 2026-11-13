'use client';
import Link from 'next/link';
import { useEffect } from 'react';
import { X, Clock, MapPin, CalendarDays, CalendarPlus, ArrowRight } from 'lucide-react';
import { useSite } from './Providers';
import Countdown from './Countdown';
import { DateBadge } from './Cards';
import { WhatsappIcon } from './Icons';
import { fmtDate, parseDate } from '@/lib/utils';
import type { Campaign, CampaignRow } from '@/lib/types';

export function calLink(e: Pick<CampaignRow, 'start_date' | 'end_date'>, title: string, venue: string): string {
  const d = (e.start_date || '').replace(/-/g, '');
  const d2 = (e.end_date || e.start_date || '').replace(/-/g, '');
  const p = new URLSearchParams({ action: 'TEMPLATE', text: title, dates: `${d}/${d2}`, location: venue || '', details: 'Suvarna Karnataka Janashakti Vedike' });
  return `https://calendar.google.com/calendar/render?${p}`;
}

export default function EventModal({ event: e, onClose }: { event: Campaign | null; onClose: () => void }) {
  const { t, tr, lang } = useSite();
  useEffect(() => {
    if (!e) return;
    const k = (ev: KeyboardEvent) => ev.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', k); document.body.style.overflow = ''; };
  }, [e, onClose]);
  if (!e) return null;
  const title = tr(e, 'title');
  const venue = tr(e, 'venue');
  const upcoming = (parseDate(e.end_date || e.start_date)?.getTime() || 0) >= Date.now() - 864e5;
  const when = fmtDate(e.start_date, lang) + (e.end_date && e.end_date !== e.start_date ? ` – ${fmtDate(e.end_date, lang)}` : '');
  const share = `https://wa.me/?text=${encodeURIComponent(`${title} — ${when}${e.time ? ', ' + e.time : ''}${venue ? ' @ ' + venue : ''}`)}`;
  return (
    <div className="modal-wrap" role="dialog" aria-modal="true" aria-label={title}>
      <div className="modal-backdrop" onClick={onClose} />
      <div className="evm">
        <div className="evm-media">
          {e.image ? <img loading="lazy" decoding="async" src={e.image} alt="" /> : <div className="img-fallback" />}
          <div className="evm-shade" />
          <button className="evm-x" onClick={onClose} aria-label={t('common.close')}><X size={20} /></button>
          <div className="evm-head">
            <DateBadge date={e.start_date} big />
            <h3>{title}</h3>
          </div>
        </div>
        <div className="evm-body">
          <div className="evm-facts">
            <div><CalendarDays size={18} /><span><small>{t('events.when')}</small><b>{when}{e.time ? ` · ${e.time}` : ''}</b></span></div>
            {venue && <div><MapPin size={18} /><span><small>{t('events.where')}</small><b>{venue}</b></span></div>}
          </div>
          {upcoming && (parseDate(e.start_date)?.getTime() || 0) > Date.now() && <Countdown date={e.start_date} />}
          {tr(e, 'summary') && <p className="evm-desc">{tr(e, 'summary')}</p>}
          <div className="evm-actions">
            {upcoming && <a className="btn btn-fire" href={calLink(e, title, venue)} target="_blank" rel="noopener noreferrer"><CalendarPlus size={17} />{t('events.addCal')}</a>}
            <a className="btn btn-ghost" href={share} target="_blank" rel="noopener noreferrer"><WhatsappIcon size={17} />{t('common.share')}</a>
            <Link className="btn btn-ghost" href={`/campaigns/${e.slug}`} onClick={onClose}>{t('camp.fullDetails')}<ArrowRight size={17} /></Link>
          </div>
        </div>
      </div>
    </div>
  );
}
