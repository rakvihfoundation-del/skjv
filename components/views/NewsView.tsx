'use client';
import type { NewsListItem } from '@/lib/types';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowRight, CalendarDays } from 'lucide-react';
import { useSite } from '@/components/site/Providers';
import PageHero from '@/components/site/PageHero';
import Reveal from '@/components/site/Reveal';
import { NewsCard } from '@/components/site/Cards';
import { NEWS_CATEGORIES } from '@/lib/resources';
import { fmtDate, photosOf } from '@/lib/utils';
import { CardSlides } from '@/components/site/MediaSlider';

export default function NewsView({ news }: { news: NewsListItem[] }) {
  const { t, tr, lang } = useSite();
  const [cat, setCat] = useState('all');
  const featured = news.find((n) => n.featured) || news[0];
  const list = useMemo(() => news.filter((n) => n.id !== featured?.id && (cat === 'all' || n.category === cat)), [news, featured, cat]);
  const cats: string[] = NEWS_CATEGORIES.filter((c) => news.some((n) => n.category === c));

  return (
    <>
      <PageHero title={t('news.title')} sub={t('news.sub')} image="/images/gallery/vidhana-soudha.jpg" crumbs={[{ label: t('nav.news') }]} />
      <section className="section">
        <div className="container">
          {!featured ? <p className="empty">{t('common.noItems')}</p> : (
            <>
              <Reveal>
                <Link href={`/news/${featured.slug}`} className="news-hero">
                  <div className="news-hero-img"><CardSlides photos={photosOf(featured).length ? photosOf(featured) : ['/images/hero-4.jpg']} alt={tr(featured, 'title')} /></div>
                  <div className="news-hero-body">
                    <span className="chip chip-gold">{t('news.featured')}</span>
                    <span className="news-date light"><CalendarDays size={15} />{fmtDate(featured.published_at, lang)} · {t(`cat.${featured.category}`)}</span>
                    <h2>{tr(featured, 'title')}</h2>
                    <p className="clamp-3">{tr(featured, 'excerpt')}</p>
                    <span className="link-arrow light">{t('common.readMore')}<ArrowRight size={18} /></span>
                  </div>
                </Link>
              </Reveal>
              <div className="tabs">
                <button className={cat === 'all' ? 'on' : ''} onClick={() => setCat('all')}>{t('common.all')}</button>
                {cats.map((c) => <button key={c} className={cat === c ? 'on' : ''} onClick={() => setCat(c)}>{t(`cat.${c}`)}</button>)}
              </div>
              {list.length === 0 ? <p className="empty">{t('common.noItems')}</p> : (
                <div className="grid-3">
                  {list.map((n, i) => <Reveal key={n.id} delay={(i % 3) * 80}><NewsCard n={n} /></Reveal>)}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}
