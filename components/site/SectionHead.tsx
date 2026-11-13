import { Flourish } from './Ornaments';
import type { ReactNode } from 'react';
import Reveal from './Reveal';

type Props = { eyebrow?: string; title: ReactNode; align?: 'center' | 'left'; light?: boolean; action?: ReactNode };

export default function SectionHead({ eyebrow, title, align = 'center', light = false, action = null }: Props) {
  return (
    <Reveal className={`section-head ${align} ${light ? 'light' : ''}`}>
      <div>
        {eyebrow && <span className="eyebrow"><i />{eyebrow}</span>}
        <h2 className="section-title">{title}</h2>
        {align === 'center' && <Flourish className="head-flourish" />}
      </div>
      {action}
    </Reveal>
  );
}
