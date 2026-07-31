import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';

interface AirportItem {
  code: string;
  name: string;
  desc: string;
}

export default async function AirportTransfers() {
  let airports: AirportItem[] = [];

  try {
    const dbAirports = await prisma.airport.findMany({
      orderBy: { displayOrder: 'asc' },
    });

    if (dbAirports && dbAirports.length > 0) {
      airports = dbAirports.map((ap) => ({
        code: ap.code,
        name: ap.name,
        desc: ap.description,
      }));
    }
  } catch (error) {
    console.error('Error fetching airports from DB for home page:', error);
  }

  // Fallback if DB returns empty
  if (airports.length === 0) {
    airports = [
      {
        code: 'BOS',
        name: 'Logan International Airport',
        desc: "Boston's primary hub — all domestic & international terminals covered.",
      },
      {
        code: 'BED',
        name: 'Hanscom Field',
        desc: 'Private aviation & corporate FBO transfers to/from Bedford, MA.',
      },
      {
        code: 'ORH',
        name: 'Worcester Regional Airport',
        desc: 'Convenient alternative to Boston — avoids Logan congestion.',
      },
      {
        code: 'MHT',
        name: 'Manchester-Boston Regional',
        desc: "New Hampshire's busiest airport — popular budget-carrier hub.",
      },
      {
        code: 'PVD',
        name: 'T.F. Green International',
        desc: 'Providence, RI — serving Southwest & JetBlue routes south of Boston.',
      },
      {
        code: 'PSM',
        name: 'Portsmouth International',
        desc: 'Pease Tradeport, NH — ideal for Seacoast & northern New England.',
      },
    ];
  }

  const travelRows = [
    { location: 'Arlington, MA', distance: '11 miles', avgTime: '25 – 40m', zone: 'Meeting Point', zoneCls: 'zone-a' },
    { location: 'Newton, MA', distance: '14 miles', avgTime: '30 – 45m', zone: 'Terminal C/E', zoneCls: 'zone-b' },
    { location: 'Cambridge, MA', distance: '6 miles', avgTime: '20 – 30m', zone: 'Limo Stand', zoneCls: 'zone-a' },
    { location: 'Lexington, MA', distance: '17 miles', avgTime: '35 – 50m', zone: 'Terminal B', zoneCls: 'zone-b' },
    { location: 'Wellesley, MA', distance: '18 miles', avgTime: '35 – 50m', zone: 'Meeting Point', zoneCls: 'zone-a' },
    { location: 'Westwood, MA', distance: '22 miles', avgTime: '40 – 55m', zone: 'Terminal B/C', zoneCls: 'zone-b' },
  ];

  return (
    <section className="airport-section section-pad" id="airport-transfers" aria-labelledby="airport-heading">
      <div className="container">
        {/* Section header */}
        <header className="airport-section__header">
          <span className="eyebrow">Logan &amp; Regional Airports</span>
          <h2 id="airport-heading">Looking for an Airport Transfer?</h2>
          <p className="airport-section__subtext" role="list">
            <span role="listitem">Fixed pricing matrix</span>
            <span role="listitem">Flight monitoring</span>
            <span role="listitem">Meet &amp; greet available</span>
          </p>
        </header>

        {/* Airport Cards Grid */}
        <div className="airport-grid" role="list" aria-label="Airports we serve">
          {airports.map((ap) => (
            <Link
              key={ap.code}
              href="/book"
              className="airport-card"
              role="listitem"
              aria-label={`Book a transfer to ${ap.name} (${ap.code})`}
            >
              <div className="airport-card__badge" aria-hidden="true">
                {ap.code}
              </div>
              <div className="airport-card__content">
                <h3 className="airport-card__name">{ap.name}</h3>
                <p className="airport-card__desc">{ap.desc}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Travel Times & Distances Table */}
        <div className="travel-table-wrap" role="region" aria-label="Travel times and distances">
          <table className="travel-table">
            <caption>Travel Times &amp; Distances from Logan Airport</caption>
            <thead>
              <tr>
                <th scope="col">Pickup Location</th>
                <th scope="col">Distance</th>
                <th scope="col">Avg. Time</th>
                <th scope="col">Pickup Zone</th>
              </tr>
            </thead>
            <tbody>
              {travelRows.map((row, idx) => (
                <tr key={idx}>
                  <td>{row.location}</td>
                  <td>{row.distance}</td>
                  <td>{row.avgTime}</td>
                  <td>
                    <span className={`zone-badge ${row.zoneCls}`}>{row.zone}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Note below table */}
        <p className="airport-section__note">
          *Traffic dependent. We recommend booking 3 hours before departure.*
        </p>
      </div>
    </section>
  );
}
