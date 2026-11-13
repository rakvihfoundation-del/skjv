import type { Metadata } from 'next';
import CampaignsView from '@/components/views/CampaignsView';
import { getCampaigns } from '@/lib/queries';

export const metadata: Metadata = { title: 'Campaigns' };

export default async function Page() {
  return <CampaignsView campaigns={await getCampaigns()} />;
}
