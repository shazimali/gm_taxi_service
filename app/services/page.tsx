import { Suspense } from 'react';
import ServicesGrid from '@/components/home/ServicesGrid';
import { prisma } from '@/lib/prisma';

// Force server-side rendering on every request so services
// are always fetched fresh from the DB in production.
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Executive Services | GM Limo Services Boston',
  description:
    'Explore GM Limo Services offerings including Airport Transfers, Hourly Chauffeur, City-to-City Long Distance, and Corporate Accounts.',
};

const DEFAULT_SERVICES_HERO = {
  servicesHeroTag: 'PREMIUM EXECUTIVE TRANSPORTATION',
  servicesHeroTitle: 'Our Luxury Services',
  servicesHeroDesc:
    'Setting the standard for executive mobility, luxury Logan Airport transfers, hourly chauffeur service, and corporate transportation across Greater Boston and New England.',
  servicesHeroImage: null as string | null,
};

export default async function ServicesPage() {
  const dbSettings = await prisma.siteSetting
    .findUnique({ where: { id: 'default' } })
    .catch(() => null);

  const hero = {
    servicesHeroTag: dbSettings?.servicesHeroTag || DEFAULT_SERVICES_HERO.servicesHeroTag,
    servicesHeroTitle: dbSettings?.servicesHeroTitle || DEFAULT_SERVICES_HERO.servicesHeroTitle,
    servicesHeroDesc: dbSettings?.servicesHeroDesc || DEFAULT_SERVICES_HERO.servicesHeroDesc,
    servicesHeroImage: dbSettings?.servicesHeroImage || DEFAULT_SERVICES_HERO.servicesHeroImage,
  };

  const heroStyle = hero.servicesHeroImage
    ? {
        paddingTop: '7rem',
        paddingBottom: '5rem',
        backgroundImage: `linear-gradient(rgba(17, 17, 17, 0.65), rgba(17, 17, 17, 0.65)), url('${hero.servicesHeroImage}')`,
      }
    : { paddingTop: '7rem', paddingBottom: '5rem' };

  return (
    <main className="services-page">
      {/* 1. Hero Banner as per /about-us */}
      <section className="about-us-hero" style={heroStyle}>
        <div className="about-us-hero__inner">
          <span className="about-section-tag" style={{ color: '#f5e4ab' }}>
            {hero.servicesHeroTag}
          </span>
          <h1 className="about-us-hero__title">{hero.servicesHeroTitle}</h1>
          <p className="about-us-hero__desc">{hero.servicesHeroDesc}</p>
        </div>
      </section>

      {/* 2. Services Grid — streamed so the hero shows immediately */}
      <Suspense fallback={
        <div style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>
          Loading services…
        </div>
      }>
        <ServicesGrid />
      </Suspense>
    </main>
  );
}
