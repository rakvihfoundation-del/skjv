'use client';
import Link from 'next/link';
import { MapPin, ArrowRight, CalendarDays } from 'lucide-react';
import { useSite } from './Providers';
import { CardSlides } from './MediaSlider';
import { fmtDate, monthShort, parseDate, initials, placeLabel, photosOf } from '@/lib/utils';
import type { Campaign, Leader, NewsListItem } from '@/lib/types';

export function DateBadge({ date, big = false }: { date: string | null | undefined; big?: boolean }) {
  const { lang } = useSite();
  const d = parseDate(date);
  if (!d) return null;
  return (
    <span className={`date-badge ${big ? 'big' : ''}`}>
      <b>{d.getDate()}</b>
      <small>{monthShort(date, lang)}</small>
    </span>
  );
}

export function NewsCard({ n, big = false }: { n: NewsListItem; big?: boolean }) {
  const { tr, t, lang } = useSite();
  return (
    <Link href={`/news/${n.slug}`} className={`news-card ${big ? 'big' : ''}`}>
      <div className="news-card-img">
        <CardSlides photos={photosOf(n)} alt={tr(n, 'title')} offset={n.id} fallback={<span className="img-fallback" />} />
        <span className="chip chip-red">{t(`cat.${n.category}`)}</span>
      </div>
      <div className="news-card-body">
        <span className="news-date"><CalendarDays size={14} />{fmtDate(n.published_at, lang)}</span>
        <h3>{tr(n, 'title')}</h3>
        <p className="muted clamp-3">{tr(n, 'excerpt')}</p>
        <span className="link-arrow">{t('common.readMore')}<ArrowRight size={16} /></span>
      </div>
    </Link>
  );
}

export function CampaignCard({ c }: { c: Campaign }) {
  const { tr, t, lang } = useSite();
  const multi = c.end_date && c.end_date !== c.start_date;
  return (
    <article className={`campaign-card st-${c.status}`}>
      <Link href={`/campaigns/${c.slug}`} className="campaign-card-img">
        <CardSlides photos={photosOf(c)} alt={tr(c, 'title')} offset={c.id} fallback={<span className="img-fallback" />} />
        <span className={`chip status-${c.status}`}>{t(`camp.${c.status}`)}</span>
        <DateBadge date={c.start_date} />
      </Link>
      <div className="campaign-card-body">
        <h3><Link href={`/campaigns/${c.slug}`}>{tr(c, 'title')}</Link></h3>
        <div className="camp-meta">
          <span><CalendarDays size={14} />{fmtDate(c.start_date, lang)}{multi ? ` – ${fmtDate(c.end_date, lang)}` : ''}{c.time ? ` · ${c.time}` : ''}</span>
          {tr(c, 'venue') && <span><MapPin size={14} />{tr(c, 'venue')}</span>}
        </div>
        <p className="muted clamp-2">{tr(c, 'summary')}</p>
        <div className="campaign-actions">
          <Link href={`/campaigns/${c.slug}`} className="btn btn-ghost btn-sm">{t('camp.fullDetails')}</Link>
        </div>
      </div>
    </article>
  );
}

export function Avatar({ src, name, className = '' }: { src?: string | null; name?: string | null; className?: string }) {
  return src ? (
    <img className={`avatar ${className}`} src={src} alt={name || ''} loading="lazy" />
  ) : (
    <span className={`avatar avatar-fallback ${className}`}>{initials(name)}</span>
  );
}

export function LeaderCard({ l }: { l: Leader }) {
  const { tr, lang } = useSite();
  return (
    <article className="leader-card">
      <div className="leader-photo">
        <Avatar src={l.photo} name={l.name_en} />
        <span className="leader-ring" />
      </div>
      <h3>{tr(l, 'name')}</h3>
      <p className="leader-role">{tr(l, 'role')}</p>
      {l.district && <p className="leader-district"><MapPin size={13} />{placeLabel(l.district, lang)}</p>}
    </article>
  );
}
