'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  LayoutDashboard, Users, HandCoins, Mail, Settings, LogOut, Menu, X, ExternalLink, FlaskConical, Loader2, type LucideIcon,
  Images, Newspaper, Megaphone, GalleryHorizontalEnd, Handshake, Camera, MapPinned, UserRound, CalendarCheck2, HeartHandshake,
} from 'lucide-react';
import type { AdminUser } from '@/lib/types';

type AdminContext = { me: AdminUser; mode: string };
const AdminCtx = createContext<AdminContext | null>(null);
export const useAdmin = () => useContext(AdminCtx);

type NavGroup = { group: string; items: [href: string, label: string, icon: LucideIcon][] };

const NAV: NavGroup[] = [
  { group: 'Overview', items: [['/admin', 'Dashboard', LayoutDashboard]] },
  { group: 'People', items: [['/admin/members', 'Members', Users], ['/admin/volunteers', 'Volunteers', HeartHandshake], ['/admin/registrations', 'Event Registrations', CalendarCheck2], ['/admin/donations', 'Donations', HandCoins], ['/admin/messages', 'Messages', Mail]] },
  {
    group: 'Website content', items: [
      ['/admin/slides', 'Hero Banners', Images], ['/admin/news', 'News', Newspaper],
      ['/admin/campaigns', 'Campaigns & Events', Megaphone], ['/admin/gallery', 'Gallery', GalleryHorizontalEnd], ['/admin/leaders', 'Leaders', UserRound],
      ['/admin/partners', 'Partners', Handshake], ['/admin/instagram', 'Instagram', Camera],
    ],
  },
  { group: 'Configuration', items: [['/admin/wards', 'Wards', MapPinned], ['/admin/settings', 'Settings', Settings]] },
];

export default function AdminShell({ children, initialMe, mode }: { children: ReactNode; initialMe: AdminUser | null; mode: string }) {
  const path = usePathname();
  const router = useRouter();
  const me = initialMe;
  const [open, setOpen] = useState(false);
  const isLogin = path === '/admin/login';

  // Not an admin (e.g. a member's session): go to the admin login. Already an admin on the login page: go in.
  useEffect(() => {
    if (!me && !isLogin) router.replace('/admin/login');
    if (me && isLogin) router.replace('/admin');
  }, [me, isLogin, router]);
  useEffect(() => { setOpen(false); }, [path]);

  if (isLogin) return <div className="adm">{children}</div>;
  if (!me) return <div className="adm adm-loading"><Loader2 className="spin" size={34} /></div>;

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.href = '/admin/login';
  }
  const active = (href: string) => (href === '/admin' ? path === '/admin' : path.startsWith(href));

  return (
    <AdminCtx.Provider value={{ me, mode }}>
      <div className={`adm adm-app ${open ? 'nav-open' : ''}`}>
        <aside className="adm-side">
          <div className="adm-brand">
            <img src="/images/logo.webp" alt="" />
            <div><b>SKJV Admin</b><small className="kn-font">ಸುವರ್ಣ ಕರ್ನಾಟಕ ಜನಶಕ್ತಿ ವೇದಿಕೆ</small></div>
            <button className="adm-side-x" onClick={() => setOpen(false)} aria-label="Close menu"><X size={20} /></button>
          </div>
          <nav className="adm-nav">
            {NAV.map((g) => (
              <div key={g.group}>
                <p className="adm-nav-group">{g.group}</p>
                {g.items.map(([href, label, I]) => (
                  <Link key={href} href={href} className={active(href) ? 'on' : ''}><I size={18} />{label}</Link>
                ))}
              </div>
            ))}
          </nav>
          <div className="adm-side-foot">
            <a href="/" target="_blank" rel="noopener noreferrer"><ExternalLink size={16} />View website</a>
            <button onClick={logout}><LogOut size={16} />Log out</button>
          </div>
        </aside>
        <div className="adm-backdrop" onClick={() => setOpen(false)} />
        <div className="adm-main">
          <header className="adm-top">
            <button className="adm-burger" onClick={() => setOpen(true)} aria-label="Open menu"><Menu size={22} /></button>
            {mode === 'demo' && (
              <Link href="/admin/settings" className="adm-demo"><FlaskConical size={15} />Payments in DEMO mode — add Razorpay keys to go live</Link>
            )}
            <div className="adm-user">
              <span className="adm-avatar">{(me.name || 'A')[0]}</span>
              <div><b>{me.name}</b><small>{me.email}</small></div>
            </div>
          </header>
          <main className="adm-content">{children}</main>
        </div>
      </div>
    </AdminCtx.Provider>
  );
}
