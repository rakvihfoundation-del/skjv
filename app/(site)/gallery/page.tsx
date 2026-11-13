import type { Metadata } from 'next';
import GalleryView from '@/components/views/GalleryView';
import { getGallery } from '@/lib/queries';

export const metadata: Metadata = { title: 'Gallery' };

export default async function Page() {
  return <GalleryView items={await getGallery()} />;
}
