'use client';
import type { MemberPublic } from '@/lib/types';
import { BadgeCheck, ShieldAlert } from 'lucide-react';
import { useSite } from '@/components/site/Providers';
import PageHero from '@/components/site/PageHero';
import IdCard from '@/components/site/IdCard';
import { fmtDate, inr, wardLabel } from '@/lib/utils';

/** The member's ID card and membership details (no account actions here; those live on /profile). */
export default function MyCardView({ member: m }: { member: MemberPublic }) {
  const { t, lang } = useSite();
  const active = m.status !== 'suspended';
  return (
    <>
      <PageHero title={`${t('mycard.hello')}, ${m.name.split(' ')[0]}`} sub={t('mycard.title')} crumbs={[{ label: t('nav.mycard') }]} />
      <section className="section">
        <div className="container mycard-grid">
          <div className="card-panel">
            <IdCard member={m} />
          </div>
          <aside className="card-panel mycard-info">
            <h3 className="panel-title">{t('mycard.details')}</h3>
            <div className={`status-pill ${active ? 'ok' : 'bad'}`}>
              {active ? <BadgeCheck size={18} /> : <ShieldAlert size={18} />}
              {t('mycard.status')}: {active ? t('mycard.active') : t('mycard.suspended')}
            </div>
            <dl className="summary">
              {[['card.memberNo', m.member_no || '—'], ['join.name', m.name], ['join.phone', '+91 ' + m.phone], ['join.email', m.email || '—'],
                ['join.ward', wardLabel(m.ward, lang)], ['join.pincode', m.pincode || '—'], ['card.since', fmtDate(m.created_at, lang)], ['mycard.paid', inr(m.amount)]]
                .map(([k, v]) => <div key={k}><dt>{t(k)}</dt><dd>{v}</dd></div>)}
            </dl>
          </aside>
        </div>
      </section>
    </>
  );
}
