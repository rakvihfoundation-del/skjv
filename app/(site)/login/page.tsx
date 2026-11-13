import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import LoginView from '@/components/views/LoginView';
import { getParticipant } from '@/lib/auth';
import { getCampaignBySlug } from '@/lib/queries';

export const metadata: Metadata = { title: 'Member Login' };

/** Only same-site paths are allowed as the page to return to after login. */
const safeNext = (v: string | string[] | undefined) =>
  typeof v === 'string' && v.startsWith('/') && !v.startsWith('//') && !v.startsWith('/\\') ? v : '/profile';

export default async function Page({ searchParams }: PageProps<'/login'>) {
  const sp = await searchParams;
  const next = safeNext(sp.next);
  if (await getParticipant().catch(() => null)) redirect(next);
  // Came here from "Log in to register" on an event: show which event and why.
  const event = typeof sp.event === 'string' ? await getCampaignBySlug(sp.event).catch(() => null) : null;
  return <LoginView next={next} as={sp.as === 'volunteer' ? 'volunteer' : 'member'} event={event ? { title_en: event.title_en, title_kn: event.title_kn } : null} />;
}
