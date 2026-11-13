'use client';
import { useEffect, useState } from 'react';
import { useSite } from './Providers';
import { parseDate } from '@/lib/utils';

export default function Countdown({ date }: { date: string | null | undefined }) {
  const { t } = useSite();
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const target = parseDate(date)?.getTime() || 0;
  const diff = Math.max(0, target - (now || target));
  const parts: [number, string][] = [
    [Math.floor(diff / 864e5), t('hero.days')],
    [Math.floor((diff / 36e5) % 24), t('hero.hrs')],
    [Math.floor((diff / 6e4) % 60), t('hero.min')],
    [Math.floor((diff / 1e3) % 60), t('hero.sec')],
  ];
  return (
    <div className="countdown">
      {parts.map(([v, l]) => (
        <span key={l}><b suppressHydrationWarning>{now ? String(v).padStart(2, '0') : '--'}</b><small>{l}</small></span>
      ))}
    </div>
  );
}
