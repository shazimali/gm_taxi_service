'use client';

import React from 'react';
import Link from 'next/link';

interface VehicleItem {
  name: string;
  model: string;
  image: string;
  pax: number;
  luggage: number;
  slug?: string;
  features: string[];
}

export default function FleetGrid({ fleet }: { fleet: VehicleItem[] }) {
  return (
    <div className="fleet-grid-full" role="list">
      {fleet.map((vehicle, idx) => {
        const vehicleSlug =
          vehicle.slug ||
          vehicle.name
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, '-')
            .replace(/-+/g, '-');

        return (
          <article key={idx} className="vehicle-card" role="listitem">
            <div className="vehicle-card__thumb">
              <div className="vehicle-card__ribbon" aria-hidden="true" />
              <img src={vehicle.image} alt={vehicle.name} loading="lazy" />
            </div>

            <div className="vehicle-card__body">
              <h3 className="vehicle-card__name">{vehicle.name}</h3>
              <p className="vehicle-card__model">{vehicle.model}</p>

              <ul className="vehicle-features">
                <li>{vehicle.pax} Passengers</li>
                <li>{vehicle.luggage} Luggage Bags</li>
                {vehicle.features.slice(0, 2).map((feat, fIdx) => (
                  <li key={fIdx}>{feat}</li>
                ))}
              </ul>

              <div className="vehicle-card__actions">
                <Link
                  href={`/book?vehicle=${vehicleSlug}`}
                  className="btn btn--gold"
                >
                  Reserve Now
                </Link>
                <Link
                  href={`/fleet/${vehicleSlug}`}
                  className="btn btn--ghost"
                >
                  View Specs
                </Link>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
