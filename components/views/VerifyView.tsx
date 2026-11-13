'use client';
import type { VerifiedMember } from '@/lib/types';
import Link from 'next/link';
import { BadgeCheck, ShieldX, ShieldAlert, MapPinned, CalendarDays } from 'lucide-react';
import { useSite } from '@/components/site/Providers';
import { Avatar } from '@/components/site/Cards';
import { fmtDate, wardLabel } from '@/lib/utils';

export default function VerifyView({ id, member: m }: { id: string; member: VerifiedMember | null }) {
  const { t, lang } = useSite();
  const ok = m && m.status !== 'suspended';
  return (
    <section className="verify-sec">
      <div className={`verify-card ${ok ? 'ok' : 'bad'}`}>
        <img className="verify-logo" src="/images/logo.webp" alt="" />
        <p className="eyebrow center"><i />{t('verify.title')}</p>
        {m ? (
          <>
            <div className="verify-photo"><Avatar src={m.photo} name={m.name} /><span className="verify-badge">{ok ? <BadgeCheck size={26} /> : <ShieldAlert size={26} />}</span></div>
            <h1>{m.name}</h1>
            <p className="verify-no">{m.member_no}</p>
            <p className={`status-pill ${ok ? 'ok' : 'bad'}`}>{ok ? t('verify.ok') : t('verify.suspended')}</p>
            <div className="verify-meta">
              <span><MapPinned size={16} />{wardLabel(m.ward, lang)}</span>
              <span><CalendarDays size={16} />{fmtDate(m.created_at, lang)}</span>
            </div>
          </>
        ) : (
          <>
            <ShieldX className="verify-x" size={64} />
            <h1>{t('verify.bad')}</h1>
            <p className="verify-no">{decodeURIComponent(id)}</p>
          </>
        )}
        <Link href="/" className="btn btn-ghost">{t('nav.home')}</Link>
      </div>
    </section>
  );
}
