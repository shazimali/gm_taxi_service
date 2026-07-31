import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';

interface ServiceGridItem {
  id: string;
  title: string;
  tag: string;
  image: string;
  description: string;
  slug: string;
}

export default async function ServicesGrid() {
  let services: ServiceGridItem[] = [];

  try {
    const dbServices = await prisma.service.findMany({
      orderBy: { createdAt: 'asc' },
    });

    if (dbServices && dbServices.length > 0) {
      services = dbServices.map((s) => ({
        id: s.id,
        title: s.name,
        tag: s.badge || 'Service',
        image: s.image || 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=600&h=380&q=80',
        description: s.shortDesc || s.tagline || s.fullDesc,
        slug: s.slug,
      }));
    }
  } catch (error) {
    console.error('Error fetching services from DB for home page:', error);
  }

  // Fallback if DB returns empty
  if (services.length === 0) {
    services = [
      {
        id: '1',
        title: 'Airport Transportation',
        tag: 'Airport Run',
        image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=600&h=380&q=80',
        description: 'Seamless Logan, TF Green, Manchester & Providence airport transfers with real-time flight monitoring and complimentary wait time.',
        slug: 'airport-transfers',
      },
      {
        id: '2',
        title: 'Hourly Private Chauffeur',
        tag: 'By The Hour',
        image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&h=380&q=80',
        description: 'Book a dedicated chauffeur by the hour — ideal for roadshows, multi-stop corporate errands, and city-wide VIP escort.',
        slug: 'hourly-chauffeur',
      },
      {
        id: '3',
        title: 'Long Distance City-to-City Transfer',
        tag: 'Long Distance',
        image: 'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&w=600&h=380&q=80',
        description: 'Flat-rate city-to-city rides between Boston, New York, Providence, Hartford & beyond — no surge pricing, ever.',
        slug: 'point-to-point',
      },
      {
        id: '4',
        title: 'Luxury Chauffeur & Limousine',
        tag: 'VIP Service',
        image: 'https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&w=600&h=380&q=80',
        description: 'White-glove chauffeur service in late-model Lincoln Continentals, Cadillac CT6s, and Escalade ESVs.',
        slug: 'corporate-accounts',
      },
      {
        id: '5',
        title: 'Event Limo Service',
        tag: 'Special Event',
        image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=600&h=380&q=80',
        description: 'Galas, concerts, sporting events, and corporate dinners — arrive on time, in style, without the parking hassle.',
        slug: 'weddings-special-events',
      },
      {
        id: '6',
        title: 'Private Wedding Limo',
        tag: 'Weddings',
        image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&h=380&q=80',
        description: 'Bespoke bridal transportation packages — rehearsal dinner through send-off, coordinated to the minute.',
        slug: 'weddings-special-events',
      },
    ];
  }

  return (
    <section className="services-section section-pad" id="our-services" aria-labelledby="services-heading">
      <div className="container">
        {/* Section header */}
        <header className="services-section__header">
          <span className="eyebrow">What We Offer</span>
          <h2 id="services-heading">Our Services</h2>
          <p className="services-section__lead">
            From Logan airport runs to cross-state transfers — professional, punctual, and always in a luxury vehicle.
          </p>
        </header>

        {/* Card grid */}
        <div className="services-grid" role="list">
          {services.map((item) => (
            <article key={item.id} className="service-card" role="listitem">
              <div className="service-card__thumb">
                <div className="service-card__ribbon" aria-hidden="true"></div>
                <span className="service-card__tag">{item.tag}</span>
                <img src={item.image} alt={item.title} loading="lazy" />
              </div>

              <div className="service-card__body">
                <h3 className="service-card__title">{item.title}</h3>
                <p className="service-card__desc">{item.description}</p>
              </div>

              <div className="service-card__footer">
                <Link
                  href="/book"
                  className="btn btn--gold btn--full"
                  aria-label={`Book ${item.title}`}
                >
                  Book Service
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
