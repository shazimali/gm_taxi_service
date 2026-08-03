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
      orderBy: { displayOrder: 'asc' },
    });

    if (dbServices && dbServices.length > 0) {
      services = dbServices.map((s) => ({
        id: s.id,
        title: s.name,
        tag: s.tagline || 'Chauffeur Service',
        image: s.image || '/images/Boston-Luxury-Chauffeur.webp',
        description: s.description || s.tagline || s.fullDetails || '',
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
        tag: 'Airport Chauffeur',
        image: '/images/Boston-Luxury-Chauffeur.webp',
        description: 'Seamless Logan, TF Green, Manchester & Providence airport transfers with real-time flight monitoring and complimentary wait time.',
        slug: 'airport-transfers',
      },
      {
        id: '2',
        title: 'Hourly Private Chauffeur',
        tag: 'By The Hour',
        image: '/images/Hourly-Chayffeur-Service-e1763051109937.jpg',
        description: 'Book a dedicated chauffeur by the hour — ideal for roadshows, multi-stop corporate errands, and city-wide VIP escort.',
        slug: 'hourly-chauffeur',
      },
      {
        id: '3',
        title: 'Long Distance City-to-City Transfer',
        tag: 'Long Distance',
        image: '/images/City-to-City-Transfer-e1763051857279.webp',
        description: 'Flat-rate city-to-city rides between Boston, New York, Providence, Hartford & beyond — no surge pricing, ever.',
        slug: 'point-to-point',
      },
      {
        id: '4',
        title: 'Luxury Chauffeur & Limousine',
        tag: 'VIP Service',
        image: '/images/Limousine-Service-e1763051925488.webp',
        description: 'White-glove chauffeur service in late-model Lincoln Continentals, Cadillac CT6s, and Escalade ESVs.',
        slug: 'corporate-accounts',
      },
      {
        id: '5',
        title: 'Event Limo Service',
        tag: 'Special Event',
        image: '/images/Event-Transportation-e1763052056749.webp',
        description: 'Galas, concerts, sporting events, and corporate dinners — arrive on time, in style, without the parking hassle.',
        slug: 'event-limo',
      },
      {
        id: '6',
        title: 'Private Wedding Limo',
        tag: 'Weddings',
        image: '/images/Wedding-Limo-Service-e1763052179994.webp',
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
