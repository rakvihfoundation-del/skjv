'use client';
import { useEffect, useRef, useState, type ElementType, type HTMLAttributes, type ReactNode } from 'react';

type RevealProps = HTMLAttributes<HTMLElement> & { as?: ElementType; delay?: number; className?: string; children?: ReactNode };

// Fades / slides children in when they scroll into view.
export default function Reveal({ as: Tag = 'div', delay = 0, className = '', children, ...rest }: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) { setShown(true); return; }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setShown(true); io.disconnect(); }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag ref={ref} className={`reveal ${shown ? 'in' : ''} ${className}`} style={{ transitionDelay: `${delay}ms` }} {...rest}>
      {children}
    </Tag>
  );
}
