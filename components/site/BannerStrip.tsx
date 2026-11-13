'use client';
import { useState } from 'react';
import { Maximize2 } from 'lucide-react';
import Reveal from './Reveal';
import Lightbox from './Lightbox';

// Full, uncropped wide banner shown mid-page (not in the hero slider).
// Tap / click opens it full-screen — useful on phones where a 4:1 banner is small.
export default function BannerStrip({ src, alt, variant = 'red', className = '' }: { src: string; alt: string; variant?: 'red' | 'white'; className?: string }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className={`strip-sec ${variant} ${className}`}>
      <div className="container">
        <Reveal className="strip-frame">
          <button type="button" onClick={() => setOpen(0)} aria-label="View banner full screen">
            <img src={src} alt={alt} width={1600} height={400} loading="lazy" />
            <span className="strip-zoom" aria-hidden="true"><Maximize2 size={16} /></span>
          </button>
          <span className="strip-shine" aria-hidden="true" />
        </Reveal>
      </div>
      <Lightbox items={[{ src, caption: '' }]} index={open} onClose={() => setOpen(null)} onIndex={() => {}} />
    </section>
  );
}
