'use client';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { useSite } from './Providers';

export type Crumb = { label: string; href?: string };

export default function PageHero({ title, sub, image = '/images/banner-red.jpg', crumbs = [], children }: {
  title: string; sub?: string | null; image?: string; crumbs?: Crumb[]; children?: ReactNode;
}) {
  const { t } = useSite();
  return (
    <section className={`page-hero ${children ? 'has-extra' : ''}`}>
      <div className="page-hero-bg" style={{ backgroundImage: `url(${image})` }} />
      <div className="page-hero-overlay" />
      <div className="container page-hero-inner">
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link href="/">{t('common.home')}</Link>
          {crumbs.map((c, i) => (
            <span key={i}><ChevronRight size={14} />{c.href ? <Link href={c.href}>{c.label}</Link> : <b>{c.label}</b>}</span>
          ))}
        </nav>
        <h1 className="page-hero-title">{title}</h1>
        {sub && <p className="page-hero-sub">{sub}</p>}
        {children && <div className="page-hero-extra">{children}</div>}
      </div>
      <div className="page-hero-flag"><i /><i /></div>
    </section>
  );
}
