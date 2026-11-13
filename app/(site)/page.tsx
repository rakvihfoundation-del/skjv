import HomeView from '@/components/views/HomeView';
import { getSlides, getUpcomingCampaigns, getGallery, getFounders, getPartners, getInstagram, getNews } from '@/lib/queries';

export default async function HomePage() {
  const [slides, events, gallery, founders, partners, instagram, news] = await Promise.all([
    getSlides(), getUpcomingCampaigns(12), getGallery(7), getFounders(), getPartners(), getInstagram(6), getNews(3),
  ]);
  return <HomeView slides={slides} events={events} gallery={gallery} founders={founders} partners={partners} instagram={instagram} news={news} />;
}
