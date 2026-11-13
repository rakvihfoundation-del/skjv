import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import JoinView, { type JoinType } from '@/components/views/JoinView';
import { getWards } from '@/lib/queries';
import { getMember, getVolunteer } from '@/lib/auth';

export const metadata: Metadata = { title: 'Sign Up' };

// Two ways to join: community membership (paid, ID card) or volunteer (free, no ID card).
export default async function Page({ searchParams }: PageProps<'/join'>) {
  const type: JoinType = (await searchParams).type === 'volunteer' ? 'volunteer' : 'community';
  const [member, volunteer] = await Promise.all([getMember().catch(() => null), getVolunteer().catch(() => null)]);
  if (member) redirect('/profile');                          // already a member
  if (volunteer && type === 'volunteer') redirect('/profile'); // already a volunteer (may still become a member)
  return <JoinView wards={await getWards()} type={type} />;
}
