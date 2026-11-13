'use client';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Slide } from '@/lib/types';
import { useSite } from './Providers';

const DURATION = 6500;

export default function HeroSlider({ slides = [] }: { slides?: Slide[] }) {
  const { member } = useSite();
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const touch = useRef<number | null>(null);
  const n = slides.length;
  const go = useCallback((d: number) => setI((x) => (x + d + n) % n), [n]);

  useEffect(() => {
    if (paused || n < 2) return;
    const id = setTimeout(() => go(1), DURATION);
    return () => clearTimeout(id);
  }, [i, paused, n, go]);

  if (!n) return null;
  return (
    <section
      className="hero"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => { touch.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (touch.current == null) return;
        const dx = e.changedTouches[0].clientX - touch.current;
        if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
        touch.current = null;
      }}
      aria-roledescription="carousel"
    >
      <div className="hero-stage">
        {slides.map((s, k) => {
          const img = <img src={s.image} alt={s.title || ''} loading={k === 0 ? 'eager' : 'lazy'} fetchPriority={k === 0 ? 'high' : 'auto'} />;
          return (
            <div key={s.id ?? k} className={`hero-slide ${k === i ? 'active' : ''}`} aria-hidden={k !== i}>
              {s.link && !(member && s.link === '/join') ? <Link href={s.link} tabIndex={k === i ? 0 : -1}>{img}</Link> : img}
            </div>
          );
        })}
        <div className="hero-vignette" />
      </div>
      {n > 1 && (
        <>
          <button className="hero-arrow prev" onClick={() => go(-1)} aria-label="Previous slide"><ChevronLeft size={24} /></button>
          <button className="hero-arrow next" onClick={() => go(1)} aria-label="Next slide"><ChevronRight size={24} /></button>
          <div className="hero-progress">
            {slides.map((_, k) => (
              <button key={k} onClick={() => setI(k)} aria-label={`Slide ${k + 1}`} className={k === i ? 'active' : k < i ? 'done' : ''}>
                <span style={{ animationDuration: `${DURATION}ms`, animationPlayState: paused ? 'paused' : 'running' }} />
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
