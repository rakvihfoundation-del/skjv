import type { Metadata } from 'next';
import DonateView from '@/components/views/DonateView';
export const metadata: Metadata = { title: 'Donate' };
export default function Page() {
  return <DonateView />;
}
