import { cookies } from 'next/headers';
import { getSettings } from '@/lib/queries';
import { getMember, getVolunteer } from '@/lib/auth';
import { supabaseConfigured } from '@/lib/supabase/env';
import { SiteProvider } from '@/components/site/Providers';
import Header from '@/components/site/Header';
import Footer from '@/components/site/Footer';
import JoinPromo from '@/components/site/JoinPromo';
import SetupNotice from '@/components/site/SetupNotice';

export const dynamic = 'force-dynamic';

export default async function SiteLayout({ children }: LayoutProps<'/'>) {
  const lang = (await cookies()).get('lang-choice')?.value === 'en' ? 'en' : 'kn';
  if (!supabaseConfigured()) return <SetupNotice />;
  const [settings, member, volunteer] = await Promise.all([getSettings(), getMember().catch(() => null), getVolunteer().catch(() => null)]);
  return (
    <SiteProvider initialLang={lang} settings={settings} initialMember={member} initialVolunteer={volunteer}>
      <Header />
      <main className="site-main">{children}</main>
      <Footer />
      <JoinPromo />
    </SiteProvider>
  );
}
