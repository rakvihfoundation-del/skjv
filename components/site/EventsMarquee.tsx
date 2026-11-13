'use client';
import { useRef, useState } from 'react';
import { Clock, MapPin, ArrowRight } from 'lucide-react';
import { useSite } from './Providers';
import { DateBadge } from './Cards';
import EventModal from './EventModal';
import type { Campaign } from '@/lib/types';

// Slowly auto-scrolling row of event cards. Pauses on hover / touch; click opens details.
export default function EventsMarquee({ events }: { events: Campaign[] }) {
  const { t, tr } = useSite();
  const [open, setOpen] = useState<Campaign | null>(null);
  const [held, setHeld] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  if (!events.length) return null;

  // Repeat short lists so the loop always fills the screen.
  let base = events;
  while (base.length < 6) base = [...base, ...events];
  const loop = [...base, ...base];
  const duration = base.length * 9; // seconds for one full pass — slow & readable

  const hold = () => { clearTimeout(timer.current); setHeld(true); };
  const release = () => { clearTimeout(timer.current); timer.current = setTimeout(() => setHeld(false), 2500); };

  return (
    <>
      <div className={`ev-marquee ${held ? 'held' : ''}`} onTouchStart={hold} onTouchEnd={release}>
        <div className="ev-track" style={{ animationDuration: `${duration}s` }}>
          {loop.map((e, i) => (
            <button
              key={i}
              className="ev-card"
              onClick={() => setOpen(e)}
              tabIndex={i < base.length && i < events.length ? 0 : -1}
              aria-hidden={i >= events.length}
            >
              <div className="ev-card-img">
                {e.image ? <img src={e.image} alt="" loading="lazy" /> : <div className="img-fallback" />}
                <DateBadge date={e.start_date} />
              </div>
              <div className="ev-card-body">
                <h3 className="clamp-2">{tr(e, 'title')}</h3>
                <p>
                  {e.time && <span><Clock size={14} />{e.time}</span>}
                  {tr(e, 'venue') && <span className="clamp-1"><MapPin size={14} />{tr(e, 'venue')}</span>}
                </p>
                <span className="ev-more">{t('events.details')}<ArrowRight size={16} /></span>
              </div>
            </button>
          ))}
        </div>
      </div>
      <EventModal event={open} onClose={() => setOpen(null)} />
    </>
  );
}
