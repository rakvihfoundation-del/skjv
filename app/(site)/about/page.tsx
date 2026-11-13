import type { Metadata } from 'next';
import AboutView from '@/components/views/AboutView';
import { getFounders } from '@/lib/queries';

export const metadata: Metadata = { title: 'About Us' };

export default async function Page() {
  return <AboutView founders={await getFounders()} />;
}
