import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export default async function HeroSection() {
  const badges = [
    'Flight Monitoring',
    'Fixed Flat Rates',
    'Meet & Greet',
    '24 / 7 Dispatch',
    'Luxury Fleet',
  ];

  let settings = {
    phoneDisplay: '(617) 784-0264',
    phoneTel: '16177840264',
    heroTitleGold: 'Boston Luxury Chauffeur',
    heroTitleMain: '— Logan Airport Car Service',
    heroSubtitle: 'Elite Corporate Travel, Private Event Transportation & Logan Airport Transfers',
  };

  try {
    const dbSettings = await prisma.siteSetting.findUnique({
      where: { id: 'default' },
    });
    if (dbSettings) {
      settings = {
        phoneDisplay: dbSettings.phoneDisplay || settings.phoneDisplay,
        phoneTel: dbSettings.phoneTel || settings.phoneTel,
        heroTitleGold: dbSettings.heroTitleGold || settings.heroTitleGold,
        heroTitleMain: dbSettings.heroTitleMain || settings.heroTitleMain,
        heroSubtitle: dbSettings.heroSubtitle || settings.heroSubtitle,
      };
    }
  } catch (err) {
    console.error('Error fetching site settings for Hero section:', err);
  }

  return (
    <section
      className="hero hero--bg"
      aria-labelledby="hero-heading"
      style={{ backgroundImage: "url('/images/hero-bg.jpg')" }}
    >
      <div className="hero__inner">
        {/* Eyebrow label */}
        <span className="hero__eyebrow">
          Boston &amp; New England&apos;s Premier Chauffeur Service
        </span>

        {/* H1 Headline */}
        <h1 id="hero-heading" className="hero__title">
          <span>{settings.heroTitleGold}</span> {settings.heroTitleMain}
        </h1>

        {/* Subtitle */}
        <p className="hero__subtitle">
          {settings.heroSubtitle}
        </p>

        {/* CTA Buttons */}
        <div className="hero__actions">
          {/* Primary CTA: Phone call */}
          <a
            href={`tel:${settings.phoneTel}`}
            className="btn btn--gold btn--two-lines"
            aria-label={`Call us at ${settings.phoneDisplay}`}
          >
            <span className="btn-subtext">CALL NOW</span>
            <span className="btn-maintext">{settings.phoneDisplay}</span>
          </a>

          {/* Secondary CTA: Booking page */}
          <Link href="/book" className="btn btn--white">
            BOOK NOW
          </Link>
        </div>

        {/* Trust Badges */}
        <div className="hero__badges" aria-label="Service guarantees">
          {badges.map((badge, idx) => (
            <span key={idx} className="hero__badge">
              {badge}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
