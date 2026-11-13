import type { Metadata, Viewport } from 'next';
import { Montserrat, Baloo_Tamma_2, Noto_Sans_Kannada } from 'next/font/google';
import { cookies } from 'next/headers';
import './globals.css';

const montserrat = Montserrat({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800', '900'], variable: '--font-montserrat', display: 'swap' });
const baloo = Baloo_Tamma_2({ subsets: ['kannada', 'latin'], weight: ['500', '600', '700', '800'], variable: '--font-baloo', display: 'swap' });
const notoKn = Noto_Sans_Kannada({ subsets: ['kannada'], weight: ['400', '500', '600', '700'], variable: '--font-noto-kn', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: { default: 'Suvarna Karnataka Janashakti Vedike | ಸುವರ್ಣ ಕರ್ನಾಟಕ ಜನಶಕ್ತಿ ವೇದಿಕೆ', template: '%s | SKJV' },
  description: 'Suvarna Karnataka Janashakti Vedike — Sanghatane, Horata, Nadaseve. A people’s movement for Kannada, Kannadigas and Karnataka.',
  icons: { icon: '/images/logo-192.png', apple: '/images/logo-192.png' },
  openGraph: { images: ['/images/hero-3.jpg'] },
};

export const viewport: Viewport = { themeColor: '#B3001B' };

export default async function RootLayout({ children }: LayoutProps<'/'>) {
  const lang = (await cookies()).get('lang-choice')?.value === 'en' ? 'en' : 'kn';
  return (
    <html lang={lang} data-scroll-behavior="smooth" data-lang={lang} className={`${montserrat.variable} ${baloo.variable} ${notoKn.variable}`}>
      <body>{children}</body>
    </html>
  );
}
