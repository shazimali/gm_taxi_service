import React from 'react';
import ServicesGrid from '@/components/home/ServicesGrid';

export const metadata = {
  title: 'Executive Services | GM Limo Services Boston',
  description:
    'Explore GM Limo Services offerings including Airport Transfers, Hourly Chauffeur, City-to-City Long Distance, and Corporate Accounts.',
};

export default function ServicesPage() {
  return (
    <main className="services-page">
      {/* 1. Hero Banner as per /about-us */}
      <section className="about-us-hero" style={{ paddingTop: '7rem', paddingBottom: '5rem' }}>
        <div className="about-us-hero__inner">
          <span className="about-section-tag" style={{ color: '#f5e4ab' }}>
            PREMIUM EXECUTIVE TRANSPORTATION
          </span>
          <h1 className="about-us-hero__title">Our Luxury Services</h1>
          <p className="about-us-hero__desc">
            Setting the standard for executive mobility, luxury Logan Airport transfers, hourly chauffeur service, and corporate transportation across Greater Boston and New England.
          </p>
        </div>
      </section>

      {/* 2. Services Grid */}
      <ServicesGrid />
    </main>
  );
}
