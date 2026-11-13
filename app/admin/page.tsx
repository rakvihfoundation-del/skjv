'use client';
import type { AdminStats } from '@/lib/types';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Users, IndianRupee, HandCoins, Mail, CalendarDays, ArrowRight, UserPlus, Newspaper, Megaphone, Images, HeartHandshake, type LucideIcon } from 'lucide-react';
import { api, PageHead } from '@/components/admin/ui';
import BarChart from '@/components/admin/BarChart';
import { Avatar } from '@/components/site/Cards';
import { inr, compact, fmtDate } from '@/lib/utils';

export default function Dashboard() {
  const [s, setS] = useState<AdminStats | null>(null);
  useEffect(() => { api<AdminStats>('/api/admin/stats').then(setS).catch(() => {}); }, []);
  if (!s) return <div className="adm-skeleton" />;
  const kpis: [string, string | number, string, LucideIcon, string][] = [
    ['Total members', s.members.toLocaleString('en-IN'), `+${s.membersMonth} this month`, Users, '/admin/members'],
    ['Volunteers', (s.volunteers ?? 0).toLocaleString('en-IN'), `+${s.volunteersMonth ?? 0} this month`, HeartHandshake, '/admin/volunteers'],
    ['Membership revenue', inr(s.membershipRevenue), 'All time', IndianRupee, '/admin/members'],
    ['Donations', inr(s.donationsTotal), `${s.donationsCount} donations`, HandCoins, '/admin/donations'],
    ['Unread messages', s.unread, `${s.upcoming} upcoming events`, Mail, '/admin/messages'],
  ];
  const hour = new Date().getHours();
  return (
    <>
      <section className="adm-dashboard-banner">
        <span className="adm-dashboard-kicker"><i />SKJV ADMINISTRATION</span>
        <PageHead title={`${hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'} 👋`} sub="Here is what is happening with the Vedike today.">
          <Link href="/admin/campaigns" className="abtn abtn-soft"><CalendarDays size={16} />Add campaign / event</Link>
          <Link href="/admin/news" className="abtn abtn-primary"><Newspaper size={16} />Publish news</Link>
        </PageHead>
        <span className="adm-dashboard-watermark" aria-hidden="true">SKJV</span>
      </section>

      <div className="kpis">
        {kpis.map(([label, value, sub, I, href]) => (
          <Link key={label} href={href} className="kpi">
            <span className="kpi-icon"><I size={20} /></span>
            <small>{label}</small>
            <b>{value}</b>
            <span className="kpi-sub">{sub}</span>
          </Link>
        ))}
      </div>

      <div className="adm-grid-2">
        <section className="acard">
          <header className="acard-head"><div><h3>New members</h3><p>Registrations per month · last 6 months</p></div></header>
          <BarChart label="New members per month" data={s.months.map((m) => ({ label: m.label, value: m.members }))} />
        </section>
        <section className="acard">
          <header className="acard-head"><div><h3>Donations received</h3><p>Amount per month (₹) · last 6 months</p></div></header>
          <BarChart label="Donations per month in rupees" color="var(--a-gold-d)" format={(v) => '₹' + compact(v)} data={s.months.map((m) => ({ label: m.label, value: m.donations }))} />
        </section>
      </div>

      <div className="adm-grid-3">
        <section className="acard">
          <header className="acard-head"><div><h3>Latest members</h3></div><Link href="/admin/members" className="alink">View all <ArrowRight size={14} /></Link></header>
          {s.recentMembers.length === 0 ? <p className="amuted pad">No members yet. Share the sign-up page to get started.</p> : (
            <ul className="alist">
              {s.recentMembers.map((m) => (
                <li key={m.id}><Avatar src={m.photo} name={m.name} className="asm" /><div><b>{m.name}</b><small>{m.member_no} · {m.ward}</small></div><span className="amuted">{fmtDate(m.created_at)}</span></li>
              ))}
            </ul>
          )}
        </section>
        <section className="acard">
          <header className="acard-head"><div><h3>Recent donations</h3></div><Link href="/admin/donations" className="alink">View all <ArrowRight size={14} /></Link></header>
          {s.recentDonations.length === 0 ? <p className="amuted pad">No donations yet.</p> : (
            <ul className="alist">
              {s.recentDonations.map((d) => (
                <li key={d.id}><span className="adot"><HandCoins size={16} /></span><div><b>{d.name}{d.anonymous ? ' (anon.)' : ''}</b><small>{d.receipt_no}</small></div><b className="agreen">{inr(d.amount)}</b></li>
              ))}
            </ul>
          )}
        </section>
        <section className="acard">
          <header className="acard-head"><div><h3>Top wards</h3><p>Members by ward</p></div></header>
          {s.wards.length === 0 ? <p className="amuted pad">Ward breakdown appears after the first sign-ups.</p> : (
            <ul className="award-list">
              {s.wards.map((w) => (
                <li key={w.ward}><span>{w.ward}</span><div className="award-bar"><i style={{ width: `${(w.c / s.wards[0].c) * 100}%` }} /></div><b>{w.c}</b></li>
              ))}
            </ul>
          )}
          <div className="quick">
            <Link href="/admin/slides"><Images size={16} />Banners</Link>
            <Link href="/admin/campaigns"><Megaphone size={16} />Campaigns</Link>
            <a href="/join" target="_blank"><UserPlus size={16} />Sign-up page</a>
          </div>
        </section>
      </div>
    </>
  );
}
