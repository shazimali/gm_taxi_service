import React from 'react';
import { prisma } from '@/lib/prisma';
import FleetSlider from './FleetSlider';

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
        slug: v.slug,
        model: v.model,
        image: v.image,
        pax: v.passengerCapacity,
        luggage: v.luggageCapacity,
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
        slug: 'executive-sedan',
        model: 'Lincoln Continental / Cadillac CT6',
        image: '/images/Businessedited-1024x526-1-e1751891182287.webp',
        pax: 3,
        luggage: 2,
        features: ['Leather Interior & Wi-Fi', '3 Passengers', '2 Large Suitcases', '2 Carry-on Bags'],
      },
      {
        name: 'Executive SUV',
        slug: 'executive-suv',
        model: 'Chevy Suburban / GMC Yukon XL',
        image: '/images/suburbanedited-1024x557-1-e1751891129532.webp',
        pax: 6,
        luggage: 5,
        features: ['Extra Legroom & Cargo Space', 'Up to 6 Passengers', '5 Large Suitcases', 'All-Wheel Drive Performance'],
      },
      {
        name: 'Premium Escalade ESV',
        slug: 'premium-escalade-esv',
        model: 'Cadillac Escalade ESV (Newest Model)',
        image: '/images/Cadillacedited-1024x556-1-e1751891079361.webp',
        pax: 6,
        luggage: 6,
        features: ['AKG Studio Audio', 'Rear Entertainment Screens', 'Panoramaroof & Heated Seats', 'VIP Executive Privacy Tint'],
      },
      {
        name: 'Stretch Limousine',
        slug: 'stretch-limousine',
        model: 'Lincoln MKT Stretch Limo',
        image: '/images/Stretch-Limousine-e1763052103444.webp',
        pax: 8,
        luggage: 4,
        features: ['Custom LED Mood Lighting', 'Built-in Ice Bar', 'Privacy Partition', 'Bluetooth Sound System'],
      },
      {
        name: 'Executive Sprinter Van',
        slug: 'executive-sprinter-van',
        model: 'Mercedes Sprinter / Ford Transit',
        image: '/images/Event-Transportation-e1763052056749.webp',
        pax: 14,
        luggage: 6,
        features: ['Up to 14 Passengers', 'Overhead Luggage Racks', 'USB Ports at Every Seat', 'Perfect for Group Shuttles'],
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

        {/* 3-Product Slider with Right-to-Left controls */}
        <FleetSlider fleet={fleet} />
      </div>
    </section>
  );
}
