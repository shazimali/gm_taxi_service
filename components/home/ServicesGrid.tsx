import { prisma } from '@/lib/prisma';
import Link from 'next/link';

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
