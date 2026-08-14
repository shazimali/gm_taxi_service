import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import type { Metadata } from 'next';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Our Service Locations | GM Executive Transport',
  description: 'Professional luxury chauffeur and executive transport services across all major cities and areas. Find your location and book your ride today.',
};

const DEFAULT_SETTINGS = {
  locationsHeroTitle: 'Our Service Locations',
  locationsHeroSubtitle: 'Luxury Executive Transport Across the Greater Area',
  locationsHeroImage: null as string | null,
};

export default async function LocationsPage() {
  // Fetch settings & locations in parallel
  const [dbSettings, locations] = await Promise.all([
    prisma.siteSetting.findUnique({ where: { id: 'default' } }).catch(() => null),
    prisma.location.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    }).catch(() => []),
  ]);

  const settings = {
    locationsHeroTitle: dbSettings?.locationsHeroTitle || DEFAULT_SETTINGS.locationsHeroTitle,
    locationsHeroSubtitle: dbSettings?.locationsHeroSubtitle || DEFAULT_SETTINGS.locationsHeroSubtitle,
    locationsHeroImage: dbSettings?.locationsHeroImage || DEFAULT_SETTINGS.locationsHeroImage,
  };

  const heroBg = settings.locationsHeroImage
    ? `linear-gradient(rgba(0,0,0,0.52) 0%, rgba(0,0,0,0.38) 100%), url('${settings.locationsHeroImage}') center/cover no-repeat`
    : 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)';

  return (
    <>
      {/* ── Hero Banner ─────────────────────────── */}
      <section
        className="locations-hero"
        style={{ background: heroBg }}
        aria-label="Locations page hero"
      >
        <div className="locations-hero__inner">
          <h1 className="locations-hero__title">{settings.locationsHeroTitle}</h1>
          <p className="locations-hero__subtitle">{settings.locationsHeroSubtitle}</p>
        </div>
      </section>

      {/* ── Intro Section ───────────────────────── */}
      <section className="locations-intro">
        <div className="locations-intro__inner">
          <h2 className="locations-intro__heading">Your Premier Executive Chauffeur</h2>
          <p className="locations-intro__body">
            Welcome to <strong>GM Executive Transport</strong>, your trusted partner for premium
            transportation. We specialise in providing an exceptional travel experience, ensuring
            every journey is safe, comfortable, and always on time.
          </p>

          <h2 className="locations-intro__heading" style={{ marginTop: '1.75rem' }}>
            Services for Every Occasion
          </h2>
          <p className="locations-intro__body">
            Whether you need a seamless airport transfer, reliable corporate travel for important
            meetings, or an elegant ride for a wedding or special event, our professional
            chauffeurs are at your service.
          </p>
        </div>
      </section>

      {/* ── Locations Grid ──────────────────────── */}
      <section className="locations-grid-section">
        <div className="locations-grid-section__inner">
          <h2 className="locations-grid-section__title">Service Areas</h2>
          <div className="locations-grid-section__underline" aria-hidden="true" />

          {locations.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#64748b', padding: '2rem 0' }}>
              Service locations coming soon. Please check back shortly.
            </p>
          ) : (
            <div className="locations-grid">
              {locations.map((loc) => (
                <div key={loc.id} className="locations-card">
                  <span className="locations-card__pin" aria-hidden="true">📍</span>
                  <span className="locations-card__name">{loc.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA Strip ───────────────────────────── */}
      <section className="locations-cta">
        <div className="locations-cta__inner">
          <h2 className="locations-cta__title">Ready to Book Your Ride?</h2>
          <p className="locations-cta__sub">
            Available 24/7 — flat rates, flight monitoring, and meet &amp; greet service included.
          </p>
          <Link href="/book" className="locations-cta__btn">
            Book a Ride
          </Link>
        </div>
      </section>
    </>
  );
}
