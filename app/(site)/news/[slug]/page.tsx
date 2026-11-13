import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import NewsDetailView from '@/components/views/NewsDetailView';
import { getNews, getNewsBySlug } from '@/lib/queries';

export async function generateMetadata({ params }: PageProps<'/news/[slug]'>): Promise<Metadata> {
  const n = await getNewsBySlug((await params).slug);
  return n ? { title: n.title_en, description: n.excerpt_en ?? undefined, openGraph: { images: n.image ? [n.image] : [] } } : {};
}

export default async function Page({ params }: PageProps<'/news/[slug]'>) {
  const { slug } = await params;
  const n = await getNewsBySlug(slug);
  if (!n) notFound();
  const related = (await getNews(4)).filter((x) => x.id !== n.id).slice(0, 3);
  return <NewsDetailView n={n} related={related} />;
}
