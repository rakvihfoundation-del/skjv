'use client';
import type { MemberPublic, MyEvent, VolunteerPublic } from '@/lib/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import {
  LogOut, BadgeCheck, ShieldAlert, CalendarDays, MapPin, ArrowRight, CalendarCheck2, Radio, CalendarClock, History, IdCard, Loader2,
  HeartHandshake, ShieldCheck, Clock, type LucideIcon,
} from 'lucide-react';
import { useSite } from '@/components/site/Providers';
import { useDialog } from '@/components/site/Dialog';
import PageHero from '@/components/site/PageHero';
import { Avatar } from '@/components/site/Cards';
import { fmtDate, wardLabel } from '@/lib/utils';

/** Member or volunteer profile: who they are, log out, and their events in tabs. */
export default function ProfileView({ member, volunteer, events }: { member?: MemberPublic; volunteer?: VolunteerPublic; events: MyEvent[] }) {
  const { t, lang } = useSite();
  const { ask } = useDialog();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const p = member ?? volunteer!;
  const isVolunteer = !member;
  const active = p.status !== 'suspended';
  const number = member ? member.member_no : volunteer?.volunteer_no;

  async function logout() {
    const yes = await ask({ title: t('profile.logoutTitle'), message: t('profile.logoutText'), confirmText: t('mycard.logout'), cancelText: t('profile.stay'), tone: 'primary', icon: LogOut });
    if (!yes) return;
    setBusy(true);
    await fetch('/api/auth/logout', { method: 'POST' });
    window.dispatchEvent(new Event('skjv:auth'));
    router.push('/');
    router.refresh();
  }

  return (
    <>
      <PageHero title={`${t('mycard.hello')}, ${p.name.split(' ')[0]}`} sub={t(isVolunteer ? 'profile.subVol' : 'profile.sub')} crumbs={[{ label: t('nav.profile') }]} />
      <section className="section profile-sec">
        <div className="container">
          <div className={`profile-card ${isVolunteer ? 'vol' : ''}`}>
            <Avatar src={member?.photo} name={p.name} className="profile-avatar" />
            <div className="profile-who">
              <h2>{p.name}{isVolunteer && <span className="vol-tag"><HeartHandshake size={14} />{t('vol.badge')}</span>}</h2>
              <p className="profile-no">{number}</p>
              <div className="profile-meta">
                <span className={`status-pill sm ${active ? 'ok' : 'bad'}`}>
                  {active ? <BadgeCheck size={15} /> : <ShieldAlert size={15} />}{active ? t('mycard.active') : t('mycard.suspended')}
                </span>
                {volunteer && (
                  <span className={`status-pill sm ${volunteer.verified ? 'ok' : 'wait'}`}>
                    {volunteer.verified ? <ShieldCheck size={15} /> : <Clock size={15} />}{t(volunteer.verified ? 'vol.verified' : 'vol.pending')}
                  </span>
                )}
                <span><MapPin size={14} />{wardLabel(p.ward, lang)}</span>
                <span><CalendarDays size={14} />{t(isVolunteer ? 'vol.since' : 'card.since')} {fmtDate(p.created_at, lang)}</span>
              </div>
            </div>
            <div className="profile-actions">
              {member && <Link href="/my-card" className="btn btn-gold"><IdCard size={18} />{t('nav.mycard')}</Link>}
              {isVolunteer && <Link href="/campaigns" className="btn btn-gold"><CalendarCheck2 size={18} />{t('mycard.browse')}</Link>}
              <button type="button" className="btn btn-ghost" onClick={logout} disabled={busy}>
                {busy ? <Loader2 className="spin" size={18} /> : <LogOut size={18} />}{t('mycard.logout')}
              </button>
            </div>
          </div>
          <MyEvents events={events} />
        </div>
      </section>
    </>
  );
}

type Tab = 'current' | 'upcoming' | 'attended';
const TABS: { key: Tab; label: string; empty: string; icon: LucideIcon }[] = [
  { key: 'current', label: 'mycard.tabCurrent', empty: 'mycard.emptyCurrent', icon: Radio },
  { key: 'upcoming', label: 'mycard.tabUpcoming', empty: 'mycard.emptyUpcoming', icon: CalendarClock },
  { key: 'attended', label: 'mycard.tabAttended', empty: 'mycard.emptyAttended', icon: History },
];

/** The member's registered events, split into happening now / upcoming / attended. */
function MyEvents({ events }: { events: MyEvent[] }) {
  const { t, tr, lang } = useSite();
  const groups = useMemo(() => {
    const by = (s: MyEvent['status']) => events.filter((e) => e.status === s);
    const asc = (a: MyEvent, b: MyEvent) => a.start_date.localeCompare(b.start_date);
    return {
      current: by('ongoing').sort(asc),
      upcoming: by('upcoming').sort(asc),
      attended: by('completed').sort((a, b) => -asc(a, b)),
    } satisfies Record<Tab, MyEvent[]>;
  }, [events]);
  const [tab, setTab] = useState<Tab>(() => (groups.current.length ? 'current' : groups.upcoming.length || !groups.attended.length ? 'upcoming' : 'attended'));
  const list = groups[tab];
  const active = TABS.find((x) => x.key === tab)!;

  return (
    <div className="my-events">
      <div>
        <div className="my-events-head">
          <h2 className="panel-title"><CalendarCheck2 size={22} />{t('mycard.events')}</h2>
          <Link href="/campaigns" className="my-events-browse">{t('mycard.browse')}<ArrowRight size={16} /></Link>
        </div>
        <div className="ev-tabs" role="tablist" aria-label={t('mycard.events')}>
          {TABS.map(({ key, label, icon: I }) => (
            <button
              key={key} type="button" role="tab" id={`tab-${key}`} aria-selected={tab === key} aria-controls="ev-tabpanel"
              className={`ev-tab ${tab === key ? 'on' : ''} t-${key}`} onClick={() => setTab(key)}
            >
              <I size={17} /><span>{t(label)}</span><em>{groups[key].length}</em>
            </button>
          ))}
        </div>
        <div id="ev-tabpanel" role="tabpanel" aria-labelledby={`tab-${tab}`} className="ev-panel" key={tab}>
          {list.length === 0 ? (
            <div className="my-events-empty">
              <active.icon size={30} />
              <p>{t(active.empty)}</p>
              {tab !== 'attended' && <Link href="/campaigns" className="btn btn-fire">{t('mycard.browse')}<ArrowRight size={18} /></Link>}
            </div>
          ) : (
            <div className="my-events-list">
              {list.map((e) => (
                <Link key={e.id} href={`/campaigns/${e.slug}`} className={`my-event ${tab}`}>
                  <span className="my-event-img">
                    <img loading="lazy" decoding="async" src={e.image || '/images/banner-red.jpg'} alt="" />
                    {tab === 'current' && <i className="live-dot">{t('camp.ongoing')}</i>}
                  </span>
                  <div>
                    <b>{tr(e, 'title')}</b>
                    <small><CalendarDays size={14} />{fmtDate(e.start_date, lang)}{e.end_date && e.end_date !== e.start_date ? ` – ${fmtDate(e.end_date, lang)}` : ''}{e.time ? ` · ${e.time}` : ''}</small>
                    {tr(e, 'venue') && <small><MapPin size={14} />{tr(e, 'venue')}</small>}
                    <small className="my-event-reg"><CalendarCheck2 size={14} />{t('mycard.regOn')} {fmtDate(e.registered_at, lang)}</small>
                  </div>
                  <ArrowRight size={18} className="my-event-go" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
