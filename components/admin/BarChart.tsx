'use client';
import { useState } from 'react';

// Single-series bar chart: one hue, 4px rounded tops anchored to the baseline,
// recessive grid, hover tooltip per bar, and a visually-hidden table for screen readers.
export type BarDatum = { label: string; value: number };

type Props = { data: BarDatum[]; format?: (v: number) => string | number; height?: number; color?: string; label: string };

export default function BarChart({ data, format = (v) => v, height = 220, color = 'var(--a-red)', label }: Props) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.value));
  const nice = Math.max(4, niceMax(max));
  const ticks = [0, 0.5, 1].map((p) => Math.round(nice * p));
  return (
    <div className="bchart">
      <div className="bchart-plot" style={{ height }}>
        <div className="bchart-grid">
          {ticks.slice().reverse().map((t, i) => (
            <div key={i} className="bchart-tick"><span>{format(t)}</span></div>
          ))}
        </div>
        <div className="bchart-bars">
          {data.map((d, i) => {
            const h = (d.value / nice) * 100;
            return (
              <div key={d.label + i} className="bchart-col" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(i)} onBlur={() => setHover(null)} tabIndex={0} aria-label={`${d.label}: ${format(d.value)}`}>
                <div className={`bchart-bar ${hover === i ? 'hi' : ''}`} style={{ height: `${Math.max(h, d.value ? 2 : 0)}%`, background: color }} />
                {hover === i && (
                  <div className="bchart-tip" style={{ bottom: `calc(${Math.max(h, 2)}% + 10px)` }}>
                    <small>{d.label}</small><b>{format(d.value)}</b>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div className="bchart-x">{data.map((d, i) => <span key={i}>{d.label}</span>)}</div>
      <table className="sr-only">
        <caption>{label}</caption>
        <tbody>{data.map((d, i) => <tr key={i}><th>{d.label}</th><td>{format(d.value)}</td></tr>)}</tbody>
      </table>
    </div>
  );
}

function niceMax(v: number): number {
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p;
}
