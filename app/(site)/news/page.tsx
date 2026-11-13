import type { Metadata } from 'next';
import NewsView from '@/components/views/NewsView';
import { getNews } from '@/lib/queries';

export const metadata: Metadata = { title: 'News' };

export default async function Page() {
  return <NewsView news={await getNews()} />;
}
