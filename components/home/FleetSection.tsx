import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';

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
        btnLayout: v.ctaType || 'both',
        features: Array.isArray(v.features) ? v.features : [],
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
        btnLayout: 'book_only',
        features: ['Leather Interior & Wi-Fi', '3 Passengers', '2 Large Suitcases', '2 Carry-on Bags'],
      },
      {
        name: 'Executive SUV',
        model: 'Cadillac Escalade / Chevy Suburban',
        image: '/images/suv.webp',
        pax: 6,
        luggage: 5,
        btnLayout: 'both',
        features: ['All-Wheel Drive Comfort', '6 Passengers', '5 Large Suitcases', '2 Carry-on Bags'],
      },
      {
        name: 'Premium Luxury SUV',
        model: 'Cadillac Escalade ESV',
        image: '/images/blc89.webp',
        pax: 6,
        luggage: 5,
        btnLayout: 'quote_only',
        features: ['Cadillac Escalade ESV', '6 Passengers', '5 Large Suitcases + Extra Cargo', 'VIP Entertainment System'],
      },
      {
        name: 'Stretch Limousine',
        model: 'Lincoln Stretch / Chrysler 300 Stretch',
        image: '/images/Limousine-Service-e1763051925488.webp',
        pax: 10,
        luggage: 2,
        btnLayout: 'both',
        features: ['8–10 Passengers Max', 'Bar & Mood Lighting', 'Bluetooth Sound System', 'Ideal for Events & Parties'],
      },
      {
        name: 'Executive Van',
        model: 'Mercedes Sprinter / Ford Transit',
        image: '/images/Event-Transportation-e1763052056749.webp',
        pax: 14,
        luggage: 6,
        btnLayout: 'both',
        features: ['Up to 14 Passengers', 'Overhead Luggage Racks', 'USB Ports at Every Seat', 'Perfect for Group Shuttles'],
      },
    ];
  }

  return (
    <section className="fleet-section section-pad" id="our-fleet" aria-labelledby="fleet-heading">
      <div className="container">
        {/* Section header */}
        <header className="fleet-section__header">
          <span className="eyebrow">The Fleet</span>
          <h2 id="fleet-heading">Premium Vehicles for Every Journey</h2>
          <p className="fleet-section__lead">
            Every vehicle is late-model, meticulously maintained, and driven by a licensed professional chauffeur.
          </p>
        </header>

        {/* Vehicle cards */}
        <div className="fleet-grid" role="list">
          {fleet.map((v, idx) => (
            <article key={idx} className="vehicle-card" role="listitem">
              {/* Thumb */}
              <div className="vehicle-card__thumb">
                <div className="vehicle-card__ribbon" aria-hidden="true"></div>
                <img src={v.image} alt={v.name} loading="lazy" />

                {/* Capacity badges over image */}
                <div className="vehicle-card__badges">
                  <span className="vehicle-badge">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                      <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                    </svg>
                    {v.pax}
                  </span>
                  <span className="vehicle-badge">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                      <path d="M17 6h-2V5a2 2 0 00-2-2h-2a2 2 0 00-2 2v1H7a2 2 0 00-2 2v11a2 2 0 002 2h10a2 2 0 002-2V8a2 2 0 00-2-2zm-6-1h2v1h-2V5zm1 13.5a.5.5 0 01-1 0V9a.5.5 0 011 0v9.5zm3 0a.5.5 0 01-1 0V9a.5.5 0 011 0v9.5zm-6 0a.5.5 0 01-1 0V9a.5.5 0 011 0v9.5z" />
                    </svg>
                    {v.luggage}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="vehicle-card__body">
                <h3 className="vehicle-card__name">{v.name}</h3>
                <p className="vehicle-card__model">{v.model}</p>

                <ul className="vehicle-features" aria-label="Vehicle features">
                  {v.features.map((f: string, fIdx: number) => (
                    <li key={fIdx}>{f}</li>
                  ))}
                </ul>

                {/* Actions */}
                <div className="vehicle-card__actions">
                  {v.btnLayout === 'book_only' && (
                    <Link href="/book" className="btn btn--gold">
                      Book Now
                    </Link>
                  )}

                  {v.btnLayout === 'quote_only' && (
                    <Link href="/contact" className="btn btn--gold">
                      Get a Quote
                    </Link>
                  )}

                  {v.btnLayout === 'both' && (
                    <>
                      <Link href="/book" className="btn btn--gold">
                        Book Now
                      </Link>
                      <a href="tel:16177840264" className="btn btn--ghost" aria-label="Call Now">
                        Call Now
                      </a>
                    </>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
