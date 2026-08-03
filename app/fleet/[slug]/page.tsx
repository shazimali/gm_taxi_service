import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Users, Luggage, Check, ArrowRight, Phone, ShieldCheck, Clock, Sparkles } from 'lucide-react';
import { FLEET_DATA } from '@/data/fleetData';
import { prisma } from '@/lib/prisma';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  const staticSlugs = FLEET_DATA.map((vehicle) => ({ slug: vehicle.slug }));
  try {
    const dbVehicles = await prisma.vehicle.findMany({ select: { slug: true } });
    const dbSlugs = dbVehicles.map((v) => ({ slug: v.slug }));
    const combined = [...staticSlugs, ...dbSlugs];
    const uniqueSlugs = Array.from(new Set(combined.map((s) => s.slug)));
    return uniqueSlugs.map((slug) => ({ slug }));
  } catch {
    return staticSlugs;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } | Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  try {
    const dbVehicle = await prisma.vehicle.findUnique({
      where: { slug: resolvedParams.slug },
    });
    if (dbVehicle) {
      return {
        title: `${dbVehicle.name} | Executive Fleet Boston | GM Limo Services`,
        description: dbVehicle.description,
      };
    }
  } catch {}

  const vehicle = FLEET_DATA.find((v) => v.slug === resolvedParams.slug);
  if (!vehicle) return { title: 'Vehicle Not Found' };
  return {
    title: `${vehicle.name} | Executive Fleet Boston | GM Limo Services`,
    description: vehicle.tagline,
  };
}

export default async function SingleFleetPage({ params }: { params: { slug: string } | Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const currentSlug = resolvedParams.slug;

  let name = '';
  let category = 'Executive Fleet';
  let model = '';
  let image = '';
  let description = '';
  let passengerCapacity = 4;
  let luggageCapacity = 3;
  let rateHourly: number | null = null;
  let features: string[] = [];

  // 1. Try fetching from live MySQL database
  try {
    const dbVehicle = await prisma.vehicle.findUnique({
      where: { slug: currentSlug },
    });

    if (dbVehicle) {
      name = dbVehicle.name;
      category = dbVehicle.category || 'Executive Fleet';
      model = dbVehicle.model || dbVehicle.name;
      image = dbVehicle.image || '/images/Businessedited-1024x526-1-e1751891182287.webp';
      description = dbVehicle.description || '';
      passengerCapacity = dbVehicle.passengerCapacity;
      luggageCapacity = dbVehicle.luggageCapacity;
      rateHourly = dbVehicle.rateHourly;

      if (typeof dbVehicle.features === 'string' && dbVehicle.features) {
        try {
          features = JSON.parse(dbVehicle.features);
        } catch {
          features = [dbVehicle.features];
        }
      } else if (Array.isArray(dbVehicle.features)) {
        features = dbVehicle.features;
      }
    }
  } catch (err) {
    console.error('Error loading vehicle from DB:', err);
  }

  // 2. Fallback to static data if database record not found
  if (!name) {
    const staticVehicle = FLEET_DATA.find((v) => v.slug === currentSlug);
    if (!staticVehicle) {
      notFound();
    }
    name = staticVehicle.name;
    category = staticVehicle.category;
    model = staticVehicle.model;
    image = staticVehicle.image;
    description = staticVehicle.description;
    passengerCapacity = staticVehicle.passengerCapacity;
    luggageCapacity = staticVehicle.luggageCapacity;
    rateHourly = staticVehicle.rateHourly || null;
    features = staticVehicle.features;
  }

  const defaultAmenities = [
    'Leather Seating',
    'High-Speed Wi-Fi',
    'Complimentary Water',
    'Device Chargers',
    'Sanitized Interiors',
    'Child Seat Available Upon Request',
  ];

  return (
    <div style={{ backgroundColor: '#f9f9f9', color: '#2d2d2d', minHeight: '100vh', paddingTop: '120px', paddingBottom: '80px' }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.25rem' }}>
        
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" style={{ marginBottom: '1.5rem' }}>
          <ol style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#6b6b6b', listStyle: 'none', padding: 0 }}>
            <li>
              <Link href="/" style={{ color: '#6b6b6b', textDecoration: 'none' }}>Home</Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/fleet" style={{ color: '#6b6b6b', textDecoration: 'none' }}>Fleet</Link>
            </li>
            <li>/</li>
            <li style={{ color: '#bfa054', fontWeight: 700 }}>{name}</li>
          </ol>
        </nav>

        {/* Page Header Banner */}
        <header style={{ marginBottom: '2.5rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#bfa054', display: 'block', marginBottom: '0.4rem' }}>
            {category} Specifications
          </span>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', fontWeight: 800, color: '#111111', margin: 0, lineHeight: 1.2 }}>
            {name}
          </h1>
          <p style={{ color: '#666666', fontSize: '1rem', marginTop: '0.4rem' }}>
            {model}
          </p>
        </header>

        {/* Main 2-Column Content Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2.5rem' }} className="fleet-detail-grid">
          <style>{`
            @media (min-width: 992px) {
              .fleet-detail-grid {
                grid-template-columns: 7fr 5fr !important;
              }
            }
          `}</style>

          {/* Left Column: Vehicle Image & Detailed Specifications */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Vehicle Main Showcase Image Card */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                borderRadius: '16px',
                backgroundColor: '#ffffff',
                border: '1px solid #e5e5e5',
                overflow: 'hidden',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.06)',
              }}
            >
              {/* Metallic Gold Ribbon Accent */}
              <div style={{ height: '4px', background: 'linear-gradient(to right, #bfa054, #f5e4ab, #bfa054)' }} />

              <div style={{ position: 'relative', width: '100%', height: '380px', backgroundColor: '#ffffff', padding: '1rem' }}>
                <img
                  src={image}
                  alt={name}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
                <span
                  style={{
                    position: 'absolute',
                    top: '20px',
                    left: '20px',
                    backgroundColor: 'rgba(17, 17, 17, 0.9)',
                    color: '#bfa054',
                    border: '1px solid rgba(191, 160, 84, 0.4)',
                    padding: '0.4rem 0.9rem',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {category}
                </span>
              </div>
            </div>

            {/* Capacity & Rate Specs Highlight Bar */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '1rem',
                backgroundColor: '#ffffff',
                padding: '1.25rem',
                borderRadius: '14px',
                border: '1px solid #e5e5e5',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.03)',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '0.5rem' }}>
                <Users size={22} color="#bfa054" style={{ marginBottom: '0.3rem' }} />
                <span style={{ fontSize: '0.75rem', color: '#666666', fontWeight: 600 }}>Passengers</span>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: '#111111' }}>Up to {passengerCapacity}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '0.5rem', borderLeft: '1px solid #f0f0f0' }}>
                <Luggage size={22} color="#bfa054" style={{ marginBottom: '0.3rem' }} />
                <span style={{ fontSize: '0.75rem', color: '#666666', fontWeight: 600 }}>Luggage</span>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: '#111111' }}>{luggageCapacity} Suitcases</span>
              </div>

              {rateHourly && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '0.5rem', borderLeft: '1px solid #f0f0f0' }}>
                  <Sparkles size={22} color="#bfa054" style={{ marginBottom: '0.3rem' }} />
                  <span style={{ fontSize: '0.75rem', color: '#666666', fontWeight: 600 }}>Hourly Rate</span>
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: '#bfa054' }}>${rateHourly}<small style={{ fontSize: '0.7rem', color: '#666666' }}>/hr</small></span>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '0.5rem', borderLeft: '1px solid #f0f0f0' }}>
                <Clock size={22} color="#bfa054" style={{ marginBottom: '0.3rem' }} />
                <span style={{ fontSize: '0.75rem', color: '#666666', fontWeight: 600 }}>Availability</span>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: '#111111' }}>24/7 On-Demand</span>
              </div>
            </div>

            {/* Vehicle Overview Section */}
            <div
              style={{
                backgroundColor: '#ffffff',
                padding: '2rem',
                borderRadius: '16px',
                border: '1px solid #e5e5e5',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.03)',
              }}
            >
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 700, color: '#111111', marginBottom: '1rem' }}>
                Vehicle Overview
              </h2>
              <p style={{ fontSize: '0.95rem', color: '#444444', lineHeight: 1.7, marginBottom: '2rem' }}>
                {description || `Experience unparalleled luxury with our ${name}. Meticulously maintained and operated by uniformed executive chauffeurs, this vehicle guarantees discreet, punctual, and stress-free travel across Boston, Logan Airport, and regional destinations.`}
              </p>

              {/* Key Features List */}
              {features.length > 0 && (
                <>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontWeight: 700, color: '#111111', marginBottom: '1rem' }}>
                    Key Performance &amp; Interior Features
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem', marginBottom: '2rem' }}>
                    {features.map((feat, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.6rem',
                          padding: '0.75rem 1rem',
                          backgroundColor: '#f9f9f9',
                          borderRadius: '10px',
                          border: '1px solid #eee',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          color: '#222222',
                        }}
                      >
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#bfa054', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
                          <Check size={12} strokeWidth={3} />
                        </div>
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Amenities Badges */}
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontWeight: 700, color: '#111111', marginBottom: '0.85rem' }}>
                Included Executive Amenities
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {defaultAmenities.map((amenity, idx) => (
                  <span
                    key={idx}
                    style={{
                      padding: '0.4rem 0.85rem',
                      borderRadius: '999px',
                      backgroundColor: 'rgba(191, 160, 84, 0.1)',
                      color: '#a6853a',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      border: '1px solid rgba(191, 160, 84, 0.25)',
                    }}
                  >
                    ✓ {amenity}
                  </span>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Sticky Reservation Card */}
          <div style={{ position: 'sticky', top: '120px' }}>
            <div
              style={{
                backgroundColor: '#ffffff',
                padding: '2rem',
                borderRadius: '16px',
                border: '1px solid #e5e5e5',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
              }}
            >
              <div style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#bfa054' }}>
                  Guaranteed Reservation
                </span>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 700, color: '#111111', marginTop: '0.25rem' }}>
                  Reserve {name}
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#666666', marginTop: '0.35rem' }}>
                  Flat-rate pricing, 24/7 live dispatch support, and real-time flight tracking.
                </p>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <Link
                  href={`/book?vehicle=${currentSlug}`}
                  className="btn btn--gold"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.6rem',
                    padding: '1rem 1.5rem',
                    borderRadius: '999px',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    textDecoration: 'none',
                    boxShadow: '0 6px 20px rgba(191, 160, 84, 0.3)',
                  }}
                >
                  <span>Book {name} Now</span>
                  <ArrowRight size={18} />
                </Link>

                <a
                  href="tel:16177840264"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.6rem',
                    padding: '0.9rem 1.5rem',
                    borderRadius: '999px',
                    backgroundColor: '#ffffff',
                    color: '#111111',
                    border: '1.5px solid #bfa054',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Phone size={16} color="#bfa054" />
                  <span>Call (617) 784-0264</span>
                </a>
              </div>

              {/* Service Guarantee Badges */}
              <div
                style={{
                  marginTop: '1.75rem',
                  paddingTop: '1.25rem',
                  borderTop: '1px solid #f0f0f0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.8rem', color: '#444444', fontWeight: 500 }}>
                  <ShieldCheck size={18} color="#bfa054" style={{ flexShrink: 0 }} />
                  <span>Vetted &amp; Uniformed Professional Chauffeurs</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.8rem', color: '#444444', fontWeight: 500 }}>
                  <Clock size={18} color="#bfa054" style={{ flexShrink: 0 }} />
                  <span>Complimentary Wait Time Included</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.8rem', color: '#444444', fontWeight: 500 }}>
                  <Sparkles size={18} color="#bfa054" style={{ flexShrink: 0 }} />
                  <span>Sanitized &amp; Cleaned Before Every Trip</span>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
