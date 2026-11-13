'use client';
import type { GalleryItem } from '@/lib/types';
import { useMemo, useState } from 'react';
import { ZoomIn, Play } from 'lucide-react';
import { useSite } from '@/components/site/Providers';
import PageHero from '@/components/site/PageHero';
import Reveal from '@/components/site/Reveal';
import Lightbox from '@/components/site/Lightbox';
import { TileMedia, flattenGallery } from '@/components/site/MediaSlider';
import { GALLERY_ALBUMS } from '@/lib/resources';

export default function GalleryView({ items }: { items: GalleryItem[] }) {
  const { t, tr } = useSite();
  const [album, setAlbum] = useState('all');
  const [lb, setLb] = useState<number | null>(null);
  const list = useMemo(
    () => items.filter((g) => album === 'all' || (album === 'videos' ? !!g.video : g.album === album)),
    [items, album],
  );
  const albums: string[] = GALLERY_ALBUMS.filter((a) => items.some((g) => g.album === a));
  const videoCount = items.filter((g) => g.video).length;
  const { flat, start } = useMemo(() => flattenGallery(list, (g) => tr(g, 'title')), [list, tr]);
  return (
    <>
      <PageHero title={t('gal.title')} sub={t('gal.sub')} image="/images/gallery/mysore-palace.jpg" crumbs={[{ label: t('nav.gallery') }]} />
      <section className="section">
        <div className="container">
          <div className="tabs center">
            <button className={album === 'all' ? 'on' : ''} onClick={() => setAlbum('all')}>{t('common.all')} <small>{items.length}</small></button>
            {videoCount > 0 && (
              <button className={album === 'videos' ? 'on' : ''} onClick={() => setAlbum('videos')}>
                <Play size={13} fill="currentColor" />{t('gal.videos')} <small>{videoCount}</small>
              </button>
            )}
            {albums.map((a) => (
              <button key={a} className={album === a ? 'on' : ''} onClick={() => setAlbum(a)}>
                {t(`album.${a}`)} <small>{items.filter((g) => g.album === a).length}</small>
              </button>
            ))}
          </div>
          {list.length === 0 ? <p className="empty">{t('common.noItems')}</p> : (
            <div className="masonry">
              {list.map((g, i) => (
                <Reveal key={g.id} className="masonry-item" delay={(i % 4) * 60}>
                  <button onClick={() => setLb(start[i])} aria-label={tr(g, 'title') || t('nav.gallery')}>
                    <TileMedia g={g} alt={tr(g, 'title')} offset={i} />
                    <span className="masonry-cap">
                      <small>{t(`album.${g.album}`)}</small>
                      <b>{tr(g, 'title')}</b>
                    </span>
                    <span className="masonry-zoom">{g.video ? <Play size={16} fill="currentColor" /> : <ZoomIn size={18} />}</span>
                  </button>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
      <Lightbox items={flat} index={lb} onClose={() => setLb(null)} onIndex={setLb} />
    </>
  );
}
