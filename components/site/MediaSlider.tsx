'use client';
import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight, Expand, Play, Images } from 'lucide-react';
import Lightbox, { type LightboxItem } from './Lightbox';
import type { GalleryItem } from '@/lib/types';
import { photosOf, videoEmbed } from '@/lib/utils';

const DELAY = 4500;

// Photo slider for news / campaign pages: side arrows, 1/3 counter on top, swipe, automatic sliding.
export default function MediaSlider({ photos = [], alt = '' }: { photos?: string[]; alt?: string }) {
  const n = photos.length;
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [lb, setLb] = useState<number | null>(null);
  const touch = useRef<number | null>(null);
  const go = useCallback((d: number) => setI((x) => (x + d + n) % n), [n]);

  useEffect(() => {
    if (paused || n < 2 || lb != null) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setTimeout(() => go(1), DELAY);
    return () => clearTimeout(id);
  }, [i, paused, n, go, lb]);

  if (!n) return null;
  return (
    <figure
      className={`mslider ${n > 1 ? 'multi' : ''}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => { touch.current = e.touches[0].clientX; setPaused(true); }}
      onTouchEnd={(e) => {
        if (touch.current != null) {
          const dx = e.changedTouches[0].clientX - touch.current;
          if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
        }
        touch.current = null;
        setPaused(false);
      }}
      aria-roledescription={n > 1 ? 'carousel' : undefined}
    >
      <div className="mslider-track" style={{ transform: `translateX(-${i * 100}%)` }}>
        {photos.map((src, k) => (
          <button type="button" key={src + k} className="mslider-slide" onClick={() => setLb(k)} aria-hidden={k !== i} tabIndex={k === i ? 0 : -1} aria-label={alt}>
            <img src={src} alt={k === i ? alt : ''} loading={k === 0 ? 'eager' : 'lazy'} />
          </button>
        ))}
      </div>
      <span className="mslider-expand" aria-hidden="true"><Expand size={16} /></span>
      {n > 1 && (
        <>
          <button type="button" className="mslider-arrow prev" onClick={() => go(-1)} aria-label="Previous photo"><ChevronLeft size={22} /></button>
          <button type="button" className="mslider-arrow next" onClick={() => go(1)} aria-label="Next photo"><ChevronRight size={22} /></button>
          <span className="mslider-count" aria-live="polite"><Images size={14} />{i + 1}/{n}</span>
        </>
      )}
      <Lightbox items={photos.map((src) => ({ src, caption: alt }))} index={lb} onClose={() => setLb(null)} onIndex={setLb} />
    </figure>
  );
}

// All media of one gallery post (photos, then the video) — for the lightbox.
export function galleryMedia(g: GalleryItem, caption: string): LightboxItem[] {
  const out: LightboxItem[] = photosOf(g).map((src) => ({ src, caption }));
  if (g.video) out.push({ video: g.video, poster: g.image || videoEmbed(g.video)?.thumb, caption });
  return out;
}

// Flattens many gallery posts into one lightbox list and remembers where each post starts.
export function flattenGallery(items: GalleryItem[], captionOf: (g: GalleryItem) => string): { flat: LightboxItem[]; start: number[] } {
  const flat: LightboxItem[] = [];
  const start: number[] = [];
  items.forEach((g) => {
    start.push(flat.length);
    flat.push(...galleryMedia(g, captionOf(g)));
  });
  return { flat, start };
}

// Photos on a card (gallery / news / campaign): slides sideways with its own arrows,
// a "1/3" counter on top, and moves to the next photo automatically.
export function CardSlides({ photos = [], alt = '', offset = 0, video = false, fallback = null }: {
  photos?: string[]; alt?: string; offset?: number; video?: boolean; fallback?: ReactNode;
}) {
  const n = photos.length;
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const touch = useRef<number | null>(null);
  const go = (d: number) => setI((x) => (x + d + n) % n);

  useEffect(() => {
    if (n < 2 || paused) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setTimeout(() => setI((x) => (x + 1) % n), 3800 + (offset % 4) * 450);
    return () => clearTimeout(id);
  }, [i, n, paused, offset]);

  const arrow = (d: number) => ({
    role: 'button', tabIndex: 0, 'aria-label': d < 0 ? 'Previous photo' : 'Next photo',
    onClick: (e: MouseEvent) => { e.preventDefault(); e.stopPropagation(); go(d); },
    onKeyDown: (e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); go(d); } },
  });

  if (!n) return <span className="cslides">{fallback || <span className="tile-blank" />}{video && <span className="tile-play" aria-hidden="true"><Play size={22} fill="currentColor" /></span>}</span>;
  return (
    <span
      className={`cslides ${n > 1 ? 'multi' : ''}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => { touch.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (touch.current == null || n < 2) return;
        const dx = e.changedTouches[0].clientX - touch.current;
        touch.current = null;
        if (Math.abs(dx) > 35) { go(dx < 0 ? 1 : -1); }
      }}
    >
      {photos.map((src, k) => (
        <img key={src + k} src={src} alt={k === i ? alt : ''} loading="lazy" draggable={false}
          className={k === i ? 'on' : ''} style={{ transform: `translateX(${(k - i) * 100}%)` }} />
      ))}
      {video && <span className="tile-play" aria-hidden="true"><Play size={22} fill="currentColor" /></span>}
      {n > 1 && (
        <>
          <span className="cs-arrow prev" {...arrow(-1)}><ChevronLeft size={18} /></span>
          <span className="cs-arrow next" {...arrow(1)}><ChevronRight size={18} /></span>
          <span className="cs-count" aria-live="polite">{i + 1}/{n}</span>
        </>
      )}
    </span>
  );
}

// Gallery tile: the post's photos (or the video thumbnail) as card slides.
export function TileMedia({ g, alt, offset = 0 }: { g: GalleryItem; alt: string; offset?: number }) {
  const photos = photosOf(g);
  const thumb = videoEmbed(g.video)?.thumb;
  return <CardSlides photos={photos.length ? photos : thumb ? [thumb] : []} alt={alt} offset={offset} video={!!g.video} />;
}
