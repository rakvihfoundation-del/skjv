'use client';
import type { LucideIcon } from 'lucide-react';
import type { Campaign, GalleryItem, InstagramPost, Leader, NewsListItem, Partner, Slide } from '@/lib/types';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import {
  ArrowRight, Heart, HandCoins, UserPlus, GraduationCap, HandHeart, Sprout, Megaphone, Activity, Route,
  Quote, CheckCircle2, Images, Users, Building2, CalendarDays,
} from 'lucide-react';
import { useSite } from '@/components/site/Providers';
import HeroSlider from '@/components/site/HeroSlider';
import HeroVideo from '@/components/site/HeroVideo';
import EventsMarquee from '@/components/site/EventsMarquee';
import SectionHead from '@/components/site/SectionHead';
import Reveal from '@/components/site/Reveal';
import TrustSection from '@/components/site/TrustSection';
import { NewsCard, Avatar } from '@/components/site/Cards';
import { InstagramIcon } from '@/components/site/Icons';
import { Flourish } from '@/components/site/Ornaments';
import Lightbox from '@/components/site/Lightbox';
import { TileMedia, flattenGallery } from '@/components/site/MediaSlider';
import IdCard from '@/components/site/IdCard';
import BannerStrip from '@/components/site/BannerStrip';
import { compact, initials } from '@/lib/utils';

function CountUp({ to, suffix = '+' }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLElement>(null);
  const [v, setV] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const dur = 1600;
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / dur);
        setV(Math.round(to * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    io.observe(el);
    return () => io.disconnect();
  }, [to]);
  return <b ref={ref}>{v.toLocaleString('en-IN')}{suffix}</b>;
}

export const PILLARS: [string, LucideIcon][] = [
  ['edu', GraduationCap], ['social', HandHeart], ['env', Sprout],
  ['rights', Megaphone], ['health', Activity], ['dev', Route],
];

type Props = {
  slides: Slide[]; events: Campaign[]; gallery: GalleryItem[]; founders: Leader[];
  partners: Partner[]; instagram: InstagramPost[]; news: NewsListItem[];
};

export default function HomeView({ slides, events, gallery, founders, partners, instagram, news }: Props) {
  const { t, tr, lang, settings: s, member } = useSite();
  const [lb, setLb] = useState<number | null>(null);
  const next = events[0];
  const fee = Number(s.membership_fee || 1500).toLocaleString('en-IN');
  const founder = founders[0];
  const coFounders = founders.slice(1);
  const handle = s.instagram_handle || 'skjv';
  const { flat: lbItems, start: lbStart } = flattenGallery(gallery, (g) => tr(g, 'title'));

  const sample = { name: lang === 'kn' ? 'ನಿಮ್ಮ ಹೆಸರು' : 'Your Name', member_no: 'SKJV-2026-000001', phone: '9876543210', ward: 'Ward 01', pincode: '560001' };

  return (
    <>
      <HeroVideo />

      {/* ---------- Action dock ---------- */}
      <div className="container dock-wrap">
        <div className={`dock ${member ? 'two' : ''}`}>
          {!member && (
            <Link href="/join" className="dock-item dock-join">
              <span className="dock-icon"><UserPlus size={22} /></span>
              <span className="dock-text"><b>{t('hero.dockJoin')}</b><small>{t('hero.dockJoinSub')}</small></span>
              <span className="dock-go dock-price">₹{fee}</span>
            </Link>
          )}
          <Link href="/donate" className="dock-item dock-donate">
            <span className="dock-icon"><HandCoins size={23} /></span>
            <span className="dock-text"><b>{t('hero.dockDonate')}</b><small>{t('hero.dockDonateSub')}</small></span>
            <span className="dock-go"><ArrowRight size={18} /></span>
          </Link>
          <Link href={next ? `/campaigns/${next.slug}` : '/campaigns'} className="dock-item dock-event">
            <span className="dock-icon"><CalendarDays size={22} /></span>
            <span className="dock-text">
              <small className="dock-label">{t('hero.dockEvent')}</small>
              <b className="clamp-2">{next ? tr(next, 'title') : t('nav.campaigns')}</b>
            </span>
            <span className="dock-go"><ArrowRight size={18} /></span>
          </Link>
        </div>
      </div>

      {/* ---------- Welcome & stats ---------- */}
      <section className="section welcome bg-a" id="welcome">
        <div className="container welcome-grid">
          <Reveal className="welcome-media">
            <div className="welcome-img main"><img loading="lazy" decoding="async" src="/images/hero-4.jpg" alt="" /></div>
            <div className="welcome-img small"><img loading="lazy" decoding="async" src="/images/gallery/veerangane.jpg" alt="" /></div>
            <div className="welcome-badge">
              <img src="/images/logo.webp" alt="" />
              <span>{t('org.tagline').split(', ').map((x, i) => <span key={i} className="blk">{x}</span>)}</span>
            </div>
          </Reveal>
          <div className="welcome-copy">
            <Reveal><span className="eyebrow"><i />{t('home.welcomeEyebrow')}</span></Reveal>
            <Reveal as="h2" className="display" delay={80}>
              {t('home.welcomeTitle1')} <span className="text-fire">{t('home.welcomeTitle2')}</span>
            </Reveal>
            <Reveal as="p" className="lead" delay={140}>{t('home.welcomeText')}</Reveal>
            <Reveal className="stats" delay={200}>
              {([
                [s.stat_members, 'home.stat.members', Users], [s.stat_districts, 'home.stat.districts', Building2],
                [s.stat_campaigns, 'home.stat.campaigns', Megaphone], [s.stat_volunteers, 'home.stat.volunteers', HandHeart],
              ] as [string | undefined, string, LucideIcon][]).map(([v, k, I]) => (
                <div className="stat" key={k}>
                  <I size={20} />
                  <CountUp to={Number(v || 0)} suffix={k === 'home.stat.districts' ? '' : '+'} />
                  <span>{t(k)}</span>
                </div>
              ))}
            </Reveal>
            <Reveal className="btn-row" delay={260}>
              <Link href="/about" className="btn btn-dark">{t('common.learnMore')}<ArrowRight size={18} /></Link>
              {!member && <Link href="/join" className="btn btn-ghost">{t('nav.signup')}</Link>}
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------- Banner showcase (moved from the top) ---------- */}
      {slides.length > 0 && (
        <section className="section showcase-sec bg-b">
          <div className="container">
            <SectionHead eyebrow={t('home.showcaseEyebrow')} title={t('home.showcaseTitle')} />
            <Reveal className="showcase-frame"><HeroSlider slides={slides} /></Reveal>
          </div>
        </section>
      )}

      {/* ---------- Pillars ---------- */}
      <section className="section pillars-sec bg-a">
        <div className="container">
          <SectionHead eyebrow={t('home.pillarsEyebrow')} title={t('home.pillarsTitle')} />
          <div className="pillars">
            {PILLARS.map(([k, I], i) => (
              <Reveal key={k} className="pillar" delay={i * 70}>
                <span className="pillar-icon"><I size={28} /></span>
                <h3>{t(`pillar.${k}`)}</h3>
                <p>{t(`pillar.${k}.d`)}</p>
                <span className="pillar-num">0{i + 1}</span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Upcoming events ---------- */}
      <section className="section events-sec bg-b">
        <div className="container">
          <SectionHead
            align="left"
            eyebrow={t('home.eventsEyebrow')}
            title={t('home.eventsTitle')}
            action={<Link href="/campaigns" className="link-arrow">{t('common.viewAll')}<ArrowRight size={18} /></Link>}
          />
          {events.length === 0 ? <p className="empty">{t('common.noItems')}</p> : null}
        </div>
        {events.length > 0 && <EventsMarquee events={events} />}
      </section>

      {/* ---------- Banner strip ---------- */}
      <BannerStrip className="bg-b" src="/images/banner-strip-red.jpg" alt={`${t('org.name')} — ${t('org.tagline')}`} />

      {/* ---------- Founders ---------- */}
      {founder && (
        <section className="section founders-sec">
          <div className="container">
            <SectionHead light eyebrow={t('home.foundersEyebrow')} title={t('home.foundersTitle')} />
            <div className="founder-grid">
              <Reveal className="founder-portrait">
                <div className="arch">
                  <Avatar src={founder.photo} name={founder.name_en} />
                </div>
                <div className="founder-plate">
                  <b>{tr(founder, 'name')}</b>
                  <span>{tr(founder, 'role')}</span>
                </div>
              </Reveal>
              <Reveal className="founder-copy" delay={120}>
                <Quote className="quote-mark" size={56} />
                <blockquote className={lang === 'kn' ? 'kn-font' : ''}>{tr(founder, 'quote')}</blockquote>
                <Flourish className="gold" width={160} />
                <p>{tr(founder, 'bio')}</p>
                <div className="founder-sign">
                  <span className="sig">{tr(founder, 'name')}</span>
                  <small>{tr(founder, 'role')}</small>
                </div>
                {coFounders.length > 0 && (
                  <div className="co-founders">
                    {coFounders.map((f) => (
                      <div key={f.id} className="co-founder">
                        <Avatar src={f.photo} name={f.name_en} />
                        <div><b>{tr(f, 'name')}</b><small>{tr(f, 'role')}</small></div>
                      </div>
                    ))}
                  </div>
                )}
                <Link href="/leaders" className="btn btn-gold">{t('nav.leaders')}<ArrowRight size={18} /></Link>
              </Reveal>
            </div>
          </div>
        </section>
      )}

      {/* ---------- Ammana Neralu Foundation (old age home) ---------- */}
      <TrustSection />

      {/* ---------- Membership CTA (visitors only) ---------- */}
      {!member && <section className="section join-band">
        <div className="container join-grid">
          <Reveal className="join-copy">
            <span className="eyebrow light"><i />{t('home.joinEyebrow')}</span>
            <h2 className="display light">{t('home.joinTitle')}</h2>
            <p>{t('home.joinText')}</p>
            <ul className="checks">
              {['home.joinB1', 'home.joinB2', 'home.joinB3', 'home.joinB4'].map((k) => (
                <li key={k}><CheckCircle2 size={20} />{t(k)}</li>
              ))}
            </ul>
            <div className="btn-row">
              <Link href="/join" className="btn btn-gold btn-lg">{t('home.joinCta')} · ₹{fee}<ArrowRight size={20} /></Link>
              <Link href="/login" className="btn btn-ghost-light">{t('nav.login')}</Link>
            </div>
          </Reveal>
          <Reveal className="join-card" delay={120}>
            <div className="float-card"><IdCard member={sample} actions={false} flippable={false} tilt /></div>
          </Reveal>
        </div>
      </section>}

      {/* ---------- Gallery ---------- */}
      <section className="section gallery-sec bg-a">
        <div className="container">
          <SectionHead
            align="left"
            eyebrow={t('home.galleryEyebrow')}
            title={t('home.galleryTitle')}
            action={<Link href="/gallery" className="link-arrow">{t('common.viewAll')}<ArrowRight size={18} /></Link>}
          />
          <div className="bento">
            {gallery.map((g, i) => (
              <Reveal key={g.id} className={`bento-item b${i}`} delay={i * 60}>
                <button onClick={() => setLb(lbStart[i])} aria-label={tr(g, 'title')}>
                  <TileMedia g={g} alt={tr(g, 'title')} offset={i} />
                  <span className="bento-cap"><Images size={16} />{tr(g, 'title')}</span>
                </button>
              </Reveal>
            ))}
          </div>
        </div>
        <Lightbox items={lbItems} index={lb} onClose={() => setLb(null)} onIndex={setLb} />
      </section>

      {/* ---------- News ---------- */}
      {news.length > 0 && (
        <section className="section news-sec bg-b">
          <div className="container">
            <SectionHead
              align="left"
              eyebrow={t('home.newsEyebrow')}
              title={t('home.newsTitle')}
              action={<Link href="/news" className="link-arrow">{t('common.viewAll')}<ArrowRight size={18} /></Link>}
            />
            <div className="grid-3">
              {news.map((n, i) => <Reveal key={n.id} delay={i * 80}><NewsCard n={n} /></Reveal>)}
            </div>
          </div>
        </section>
      )}

      {/* ---------- Partners ---------- */}
      {partners.length > 0 && (
        <section className="section partners-sec bg-a">
          <div className="container">
            <SectionHead eyebrow={t('home.partnersEyebrow')} title={t('home.partnersTitle')} />
          </div>
          <div className="marquee-rows">
            {[0, 1].map((row) => (
              <div key={row} className={`logo-marquee ${row ? 'reverse' : ''}`}>
                <div className="logo-track">
                  {[...partners, ...partners, ...partners].map((p, i) => {
                    const inner = p.logo ? (
                      <img loading="lazy" decoding="async" src={p.logo} alt={p.name} />
                    ) : (
                      <>
                        <span className="partner-mono">{initials(p.name)}</span>
                        <span className="partner-name">{p.name}</span>
                      </>
                    );
                    return p.url ? (
                      <a key={i} className="partner" href={p.url} target="_blank" rel="noopener noreferrer">{inner}</a>
                    ) : (
                      <div key={i} className="partner">{inner}</div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ---------- Instagram ---------- */}
      <section className="section insta-sec bg-b">
        <div className="container">
          <div className="insta-head">
            <Reveal className="insta-id">
              <span className="insta-avatar"><img loading="lazy" decoding="async" src="/images/logo.webp" alt="" /></span>
              <div>
                <span className="eyebrow"><i />{t('home.instaEyebrow')}</span>
                <h2 className="section-title">{t('home.instaTitle')} <span className="text-insta">@{handle}</span></h2>
              </div>
            </Reveal>
            <a className="btn btn-insta" href={s.instagram_url || `https://instagram.com/${handle}`} target="_blank" rel="noopener noreferrer">
              <InstagramIcon size={18} />{t('home.instaFollow')}
            </a>
          </div>
          <div className="insta-grid">
            {instagram.map((p, i) => (
              <Reveal key={p.id} delay={i * 60}>
                <a className="insta-post" href={p.url || s.instagram_url || '#'} target="_blank" rel="noopener noreferrer">
                  <img src={p.image} alt="" loading="lazy" />
                  <span className="insta-over">
                    <span><Heart size={18} fill="currentColor" />{compact(p.likes)}</span>
                    <small className="clamp-3">{p.caption}</small>
                  </span>
                  <InstagramIcon className="insta-corner" size={18} />
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
