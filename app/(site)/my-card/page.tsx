import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getMember, getVolunteer } from '@/lib/auth';
import MyCardView from '@/components/views/MyCardView';

export const metadata: Metadata = { title: 'My ID Card' };

export default async function Page() {
  const member = await getMember();
  if (!member) redirect((await getVolunteer().catch(() => null)) ? '/profile' : '/login?next=/my-card'); // volunteers have no ID card
  return <MyCardView member={member} />;
}
