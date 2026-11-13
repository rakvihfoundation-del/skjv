'use client';
import { useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { videoEmbed } from '@/lib/utils';

/** A photo (`src`) or a video (`video`: file URL or YouTube / Vimeo link). */
export type LightboxItem = { src?: string; video?: string; poster?: string | null; caption?: string };

type Props = { items: LightboxItem[]; index: number | null; onClose: () => void; onIndex: (i: number) => void };

export default function Lightbox({ items, index, onClose, onIndex }: Props) {
  const open = index != null;
  const touch = useRef<number | null>(null);
  useEffect(() => {
    if (index == null) return;
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onIndex((index + 1) % items.length);
      if (e.key === 'ArrowLeft') onIndex((index - 1 + items.length) % items.length);
    };
    window.addEventListener('keydown', key);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', key); document.body.style.overflow = ''; };
  }, [open, index, items.length, onClose, onIndex]);
  if (index == null || !items[index]) return null;
  const it = items[index];
  const v = it.video ? videoEmbed(it.video) : null;
  const go = (d: number) => onIndex((index + d + items.length) % items.length);
  return (
    <div
      className="lightbox" role="dialog" aria-modal="true" onClick={onClose}
      onTouchStart={(e) => { touch.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (touch.current == null || items.length < 2) return;
        const dx = e.changedTouches[0].clientX - touch.current;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
        touch.current = null;
      }}
    >
      <button className="lb-close" onClick={onClose} aria-label="Close"><X size={26} /></button>
      {items.length > 1 && <button className="lb-nav prev" onClick={(e) => { e.stopPropagation(); go(-1); }} aria-label="Previous"><ChevronLeft size={30} /></button>}
      <figure onClick={(e) => e.stopPropagation()} className={v ? 'is-video' : ''}>
        {v?.kind === 'embed' ? (
          <iframe key={v.src} src={v.src} title={it.caption || 'Video'} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen />
        ) : v ? (
          <video key={v.src} src={v.src} poster={it.poster ?? undefined} controls autoPlay playsInline />
        ) : (
          <img key={it.src} src={it.src} alt={it.caption || ''} />
        )}
        {(it.caption || items.length > 1) && <figcaption>{it.caption}{items.length > 1 && <span>{index + 1} / {items.length}</span>}</figcaption>}
      </figure>
      {items.length > 1 && <button className="lb-nav next" onClick={(e) => { e.stopPropagation(); go(1); }} aria-label="Next"><ChevronRight size={30} /></button>}
    </div>
  );
}
