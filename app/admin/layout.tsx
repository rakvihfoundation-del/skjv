import type { Metadata } from 'next';
import { getSettings } from '@/lib/queries';
import { supabaseConfigured } from '@/lib/supabase/env';
import { SiteProvider } from '@/components/site/Providers';
import AdminShell from '@/components/admin/AdminShell';
import { getAdmin } from '@/lib/auth';
import { paymentMode } from '@/lib/payments';
import SetupNotice from '@/components/site/SetupNotice';
import '@/components/admin/admin.css';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Admin', robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: LayoutProps<'/admin'>) {
  if (!supabaseConfigured()) return <SetupNotice />;
  // Who is signed in is known on the server, so the panel renders at once (no extra browser round trip).
  const [settings, admin] = await Promise.all([getSettings(), getAdmin().catch(() => null)]);
  return (
    <SiteProvider initialLang="en" settings={settings} variant="admin">
      <AdminShell initialMe={admin} mode={paymentMode()}>{children}</AdminShell>
    </SiteProvider>
  );
}
