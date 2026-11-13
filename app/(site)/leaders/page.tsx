import type { Metadata } from 'next';
import LeadersView from '@/components/views/LeadersView';
import { getLeaders } from '@/lib/queries';

export const metadata: Metadata = { title: 'Leaders' };

export default async function Page() {
  return <LeadersView leaders={await getLeaders()} />;
}
