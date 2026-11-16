import type { Metadata } from 'next';
import IssuesView from '@/components/views/IssuesView';

export const metadata: Metadata = { title: 'Report an Issue' };

export default function IssuesPage() {
  return <IssuesView />;
}
