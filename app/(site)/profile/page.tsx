import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getMember, getVolunteer } from '@/lib/auth';
import { myEvents } from '@/lib/events';
import ProfileView from '@/components/views/ProfileView';

export const metadata: Metadata = { title: 'My Profile & Events' };

// Members and volunteers share this page: who they are, log out, and their events.
export default async function Page() {
  const [member, volunteer] = await Promise.all([getMember(), getVolunteer()]);
  if (member) {
    const events = await myEvents({ kind: 'member', id: member.id, name: member.name, status: member.status, number: member.member_no });
    return <ProfileView member={member} events={events} />;
  }
  if (volunteer) {
    const events = await myEvents({ kind: 'volunteer', id: volunteer.id, name: volunteer.name, status: volunteer.status, number: volunteer.volunteer_no });
    return <ProfileView volunteer={volunteer} events={events} />;
  }
  redirect('/login?next=/profile');
}
