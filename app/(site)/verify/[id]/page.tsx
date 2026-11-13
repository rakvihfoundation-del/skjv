import type { Metadata } from 'next';
import VerifyView from '@/components/views/VerifyView';
import { getMemberByNo } from '@/lib/queries';

export const metadata: Metadata = { title: 'Member Verification', robots: { index: false } };

export default async function Page({ params }: PageProps<'/verify/[id]'>) {
  const { id } = await params;
  const no = decodeURIComponent(id);
  return <VerifyView id={no} member={await getMemberByNo(no)} />;
}
