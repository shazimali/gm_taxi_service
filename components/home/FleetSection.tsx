import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function FleetSection() {
  let fleet: any[] = [];

  try {
    const dbVehicles = await prisma.vehicle.findMany({
      orderBy: { displayOrder: 'asc' },
    });

    if (dbVehicles && dbVehicles.length > 0) {
      fleet = dbVehicles.map((v) => ({
        name: v.name,
        model: v.model,
        image: v.image,
        pax: v.passengerCapacity,
        luggage: v.luggageCapacity,
        btnLayout: 'both',
        features: typeof v.features === 'string' ? JSON.parse(v.features) : (Array.isArray(v.features) ? v.features : []),
      }));
    }
  } catch (err) {
    console.error('Database fetch fallback for FleetSection:', err);
  }

  // Fallback if database is empty
  if (fleet.length === 0) {
    fleet = [
      {
        name: 'Business Class Sedan',
        model: 'Lincoln Continental / Cadillac CT6',
        image: '/images/Businessedited-1024x526-1-e1751891182287.webp',
        pax: 3,
        luggage: 2,
        btnLayout: 'both',
        features: ['Leather Interior & Wi-Fi', '3 Passengers', '2 Large Suitcases', '2 Carry-on Bags'],
      },
      {
        name: 'Executive SUV',
        model: 'Chevy Suburban / GMC Yukon XL',
        image: '/images/suburbanedited-1024x557-1-e1751891129532.webp',
        pax: 6,
        luggage: 5,
        btnLayout: 'both',
        features: ['Extra Legroom & Cargo Space', 'Up to 6 Passengers', '5 Large Suitcases', 'All-Wheel Drive Performance'],
      },
      {
        name: 'Premium Escalade ESV',
        model: 'Cadillac Escalade ESV (Newest Model)',
        image: '/images/Cadillacedited-1024x556-1-e1751891079361.webp',
        pax: 6,
        luggage: 6,
        btnLayout: 'both',
        features: ['AKG Studio Audio', 'Rear Entertainment Screens', 'Panoramaroof & Heated Seats', 'VIP Executive Privacy Tint'],
      },
    ];
  }

  return (
    <section className="fleet-section section-pad" id="our-fleet" aria-labelledby="fleet-heading">
      <div className="container">
        {/* Section header */}
        <header className="fleet-section__header">
          <span className="eyebrow">Our Executive Fleet</span>
          <h2 id="fleet-heading">Late-Model Luxury Vehicles</h2>
          <p className="fleet-section__lead">
            Every vehicle in our fleet is meticulously cleaned, sanitized before each ride, and operated by a vetted professional chauffeur.
          </p>
        </header>

        {/* Fleet Grid */}
        <div className="fleet-grid">
          {fleet.map((vehicle, idx) => (
            <article key={idx} className="fleet-card">
              <div className="fleet-card__image-container">
                <img
                  src={vehicle.image}
                  alt={vehicle.name}
                  loading="lazy"
                  className="fleet-card__image"
                />
              </div>

              <div className="fleet-card__content">
                <div className="fleet-card__header">
                  <h3 className="fleet-card__title">{vehicle.name}</h3>
                  <p className="fleet-card__subtitle">{vehicle.model}</p>
                </div>

                {/* Specs */}
                <div className="fleet-card__specs">
                  <div className="fleet-spec">
                    <span className="fleet-spec__icon" aria-hidden="true">👤</span>
                    <span className="fleet-spec__text">{vehicle.pax} Passengers</span>
                  </div>
                  <div className="fleet-spec">
                    <span className="fleet-spec__icon" aria-hidden="true">🧳</span>
                    <span className="fleet-spec__text">{vehicle.luggage} Luggages</span>
                  </div>
                </div>

                {/* Features list */}
                <ul className="fleet-card__features">
                  {vehicle.features.map((feat: string, fIdx: number) => (
                    <li key={fIdx} className="fleet-card__feature-item">
                      <span className="fleet-feature-check" aria-hidden="true">✓</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                {/* Actions */}
                <div className="fleet-card__actions">
                  <Link
                    href={`/book?vehicle=${vehicle.name.toLowerCase().replace(/\s+/g, '-')}`}
                    className="btn btn--gold btn--full"
                  >
                    Reserve Vehicle
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
