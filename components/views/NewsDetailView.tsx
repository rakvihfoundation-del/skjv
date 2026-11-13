'use client';
import type { News, NewsListItem } from '@/lib/types';
import { useEffect, useState } from 'react';
import { CalendarDays, Link2, Check } from 'lucide-react';
import { useSite } from '@/components/site/Providers';
import PageHero from '@/components/site/PageHero';
import SectionHead from '@/components/site/SectionHead';
import { NewsCard } from '@/components/site/Cards';
import { WhatsappIcon, FacebookIcon, XIcon } from '@/components/site/Icons';
import { fmtDate, photosOf } from '@/lib/utils';
import MediaSlider from '@/components/site/MediaSlider';

export function ShareBar({ title }: { title: string }) {
  const { t } = useSite();
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState('');
  useEffect(() => setUrl(window.location.href), []);
  const e = encodeURIComponent;
  return (
    <div className="share-bar">
      <span>{t('common.share')}</span>
      <a href={`https://wa.me/?text=${e(title + ' ' + url)}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="wa"><WhatsappIcon /></a>
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${e(url)}`} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="fb"><FacebookIcon /></a>
      <a href={`https://x.com/intent/tweet?text=${e(title)}&url=${e(url)}`} target="_blank" rel="noopener noreferrer" aria-label="X" className="xx"><XIcon /></a>
      <button onClick={() => { navigator.clipboard?.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 1800); }} aria-label={t('common.copyLink')}>
        {copied ? <Check size={18} /> : <Link2 size={18} />}
      </button>
    </div>
  );
}

export function Body({ text }: { text: string | null | undefined }) {
  const { lang } = useSite();
  return (
    <div className={`prose ${lang === 'kn' ? 'kn' : ''}`}>
      {String(text || '').split(/\n{2,}|\r\n\r\n/).map((p, i) => <p key={i}>{p}</p>)}
    </div>
  );
}

export default function NewsDetailView({ n, related }: { n: News; related: NewsListItem[] }) {
  const { t, tr, lang } = useSite();
  return (
    <>
      <PageHero title={tr(n, 'title')} image={n.image || '/images/banner-red.jpg'} crumbs={[{ label: t('nav.news'), href: '/news' }, { label: t(`cat.${n.category}`) }]} />
      <section className="section">
        <div className="container article">
          <div className="article-meta">
            <span className="chip chip-red">{t(`cat.${n.category}`)}</span>
            <span className="news-date"><CalendarDays size={15} />{fmtDate(n.published_at, lang)}</span>
          </div>
          {tr(n, 'excerpt') && <p className="article-lead">{tr(n, 'excerpt')}</p>}
          <MediaSlider photos={photosOf(n)} alt={tr(n, 'title')} />
          <Body text={tr(n, 'body')} />
          <ShareBar title={tr(n, 'title')} />
        </div>
      </section>
      {related.length > 0 && (
        <section className="section tinted">
          <div className="container">
            <SectionHead title={t('news.related')} />
            <div className="grid-3">{related.map((r) => <NewsCard key={r.id} n={r} />)}</div>
          </div>
        </section>
      )}
    </>
  );
}
