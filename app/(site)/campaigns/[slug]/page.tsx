import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CampaignDetailView from '@/components/views/CampaignDetailView';
import { getCampaignBySlug, getCampaigns } from '@/lib/queries';
import { getParticipant } from '@/lib/auth';
import { registrationInfo } from '@/lib/events';

export async function generateMetadata({ params }: PageProps<'/campaigns/[slug]'>): Promise<Metadata> {
  const c = await getCampaignBySlug((await params).slug);
  return c ? { title: c.title_en, description: c.summary_en ?? undefined } : {};
}

export default async function Page({ params }: PageProps<'/campaigns/[slug]'>) {
  const { slug } = await params;
  const c = await getCampaignBySlug(slug);
  if (!c) notFound();
  const who = await getParticipant().catch(() => null);
  const [all, registration] = await Promise.all([getCampaigns(), registrationInfo(c.id, who)]);
  const others = all.filter((x) => x.id !== c.id).slice(0, 3);
  return <CampaignDetailView c={c} others={others} registration={registration} />;
}
