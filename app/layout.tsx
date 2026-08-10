import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './main.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
  fallback: ['Georgia', 'serif'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://gmlimoservices.com'),
  title: 'GM Limo Services | Boston Executive Chauffeur & Airport Limousine',
  description: 'Premium executive chauffeur & airport limousine services in Boston, MA. 24/7 airport transfers for Logan BOS, TF Green PVD, Hanscom BED, corporate roadshows, and city-to-city private luxury travel.',
  keywords: [
    'Boston limo service',
    'Logan airport chauffeur',
    'Boston executive car service',
    'Cadillac Escalade Boston limo',
    'BOS airport transfer',
    'Boston chauffeur service',
    'private jet luxury transfer',
  ],
  authors: [{ name: 'GM Limo Services' }],
  openGraph: {
    title: 'GM Limo Services | Boston Executive Chauffeur',
    description: 'Premier luxury limousine and executive car service in Greater Boston and New England.',
    url: 'https://gmlimoservices.com',
    siteName: 'GM Limo Services',
    images: [
      {
        url: '/images/hero-bg.jpg',
        width: 1920,
        height: 900,
        alt: 'GM Limo Services Executive Luxury SUV',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-US" data-scroll-behavior="smooth" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'LimousineService',
              name: 'GM Limo Services',
              image: 'https://gmlimoservices.com/images/hero-bg.jpg',
              telephone: '+1-617-784-0264',
              email: 'info@bostonluxurychauffeur.com',
              address: {
                '@type': 'PostalAddress',
                addressLocality: 'Boston',
                addressRegion: 'MA',
                addressCountry: 'US',
              },
              geo: {
                '@type': 'GeoCoordinates',
                latitude: 42.3601,
                longitude: -71.0589,
              },
              areaServed: ['Boston', 'Cambridge', 'Brookline', 'Newton', 'Waltham', 'New England', 'Providence', 'New York City'],
              priceRange: '$$$',
            }),
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <div id="page" className="site">
          <a className="skip-link screen-reader-text" href="#primary">
            Skip to content
          </a>
          <Header />
          <main id="primary" className="site-main">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
