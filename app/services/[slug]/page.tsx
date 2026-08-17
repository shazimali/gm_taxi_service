import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Check, ArrowRight, Phone } from 'lucide-react';
import { SERVICES_DATA } from '@/data/servicesData';
import { prisma } from '@/lib/prisma';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export interface ServiceBullet {
  title: string;
  description: string;
}

export interface ServiceModule {
  id?: string;
  heading: string;
  image: string;
  imagePosition?: 'left' | 'right';
  bullets: ServiceBullet[];
}

export async function generateStaticParams() {
  const staticSlugs = SERVICES_DATA.map((service) => ({
    slug: service.slug,
  }));

  try {
    const dbServices = await prisma.service.findMany({ select: { slug: true } });
    const dbSlugs = dbServices.map((s) => ({ slug: s.slug }));
    const combined = [...staticSlugs, ...dbSlugs];
    const uniqueSlugs = Array.from(new Set(combined.map((s) => s.slug)));
    return uniqueSlugs.map((slug) => ({ slug }));
  } catch {
    return staticSlugs;
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string } | Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const currentSlug = resolvedParams.slug;

  try {
    const dbService = await prisma.service.findUnique({
      where: { slug: currentSlug },
    });
    if (dbService) {
      return {
        title: `${dbService.name} | GM Limo Services Boston`,
        description: dbService.tagline || dbService.description,
      };
    }
  } catch {}

  const service = SERVICES_DATA.find((s) => s.slug === currentSlug);
  if (!service) return { title: 'Service Not Found' };
  return {
    title: `${service.title} | GM Limo Services Boston`,
    description: service.tagline,
  };
}

export default async function SingleServicePage({
  params,
}: {
  params: { slug: string } | Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const currentSlug = resolvedParams.slug;

  let title = '';
  let badge = 'Service';
  let icon = '🚘';
  let tagline = '';
  let image = '';
  let modules: ServiceModule[] = [];

  // 1. Fetch from live MySQL database
  try {
    const dbService = await prisma.service.findUnique({
      where: { slug: currentSlug },
    });

    if (dbService) {
      title = dbService.name;
      tagline = dbService.tagline || '';
      image = dbService.image || '/images/Boston-Luxury-Chauffeur.webp';
      badge = dbService.tagline || 'Chauffeur Service';

      if (dbService.fullDetails && dbService.fullDetails.trim().startsWith('[')) {
        try {
          modules = JSON.parse(dbService.fullDetails);
        } catch {
          modules = [];
        }
      }
    }
  } catch (err) {
    console.error('Error loading service from DB:', err);
  }

  // 2. Fallback to static data if not found in database
  if (!title) {
    const staticService = SERVICES_DATA.find((s) => s.slug === currentSlug);
    if (!staticService) {
      notFound();
    }
    title = staticService.title;
    badge = staticService.badge;
    icon = staticService.icon;
    tagline = staticService.tagline;
    image = staticService.image;
  }

  // If no modules exist yet, generate standard starter modules matching reference design
  if (modules.length === 0) {
    modules = [
      {
        id: 'mod-1',
        heading: `Why Choose GM Limo Services for ${title}?`,
        image: image || '/images/Boston-Luxury-Chauffeur.webp',
        imagePosition: 'left',
        bullets: [
          {
            title: 'Luxury Fleet Options',
            description:
              'From sleek sedans to executive SUVs, we offer a diverse fleet to suit individual executives or large corporate groups.',
          },
          {
            title: 'Experienced Chauffeurs',
            description:
              'Our drivers are trained to deliver discreet, professional, and reliable service for every client.',
          },
          {
            title: 'Tailored Business Solutions',
            description:
              'We design transportation plans to fit the specific needs of your company, whether daily, weekly, or event-based.',
          },
        ],
      },
      {
        id: 'mod-2',
        heading: `Benefits of ${title} With GM Limo Services`,
        image: '/images/Event-Transportation-e1763052056749.webp',
        imagePosition: 'right',
        bullets: [
          {
            title: 'Professional Image',
            description:
              'Arriving in a luxury vehicle enhances your credibility and sets the right tone for business meetings.',
          },
          {
            title: 'Stress-Free Transportation',
            description:
              'With our skilled chauffeurs and efficient planning, you can focus on work while we handle the roads.',
          },
          {
            title: 'Time Efficiency',
            description:
              'We provide punctual, reliable transportation so you never waste valuable time waiting or navigating traffic.',
          },
        ],
      },
    ];
  }

  const heroBackgroundImage = image || '/images/Boston-Luxury-Chauffeur.webp';

  return (
    <main className="service-detail-page min-h-screen">
      {/* ── 1. Hero Section (Using Service Uploaded Image & Service Name) ── */}
      <section
        className="about-us-hero"
        style={{
          backgroundImage: `linear-gradient(rgba(17, 17, 17, 0.72), rgba(17, 17, 17, 0.72)), url('${heroBackgroundImage}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          paddingTop: '7.5rem',
          paddingBottom: '5rem',
        }}
      >
        <div className="about-us-hero__inner">
          {/* Breadcrumb Navigation */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              fontSize: '0.82rem',
              color: 'rgba(255,255,255,0.7)',
              marginBottom: '1.25rem',
            }}
          >
            <Link
              href="/"
              style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}
              className="hover:text-[#c5a059]"
            >
              Home
            </Link>
            <span>/</span>
            <Link
              href="/services"
              style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}
              className="hover:text-[#c5a059]"
            >
              Services
            </Link>
            <span>/</span>
            <span style={{ color: '#ffffff', fontWeight: 600 }}>{title}</span>
          </div>

          <span className="about-section-tag" style={{ color: '#f5e4ab' }}>
            {icon} {badge.toUpperCase()}
          </span>

          {/* Heading as Service Name */}
          <h1 className="about-us-hero__title">{title}</h1>

          {/* Subtitle Tagline */}
          {tagline && <p className="about-us-hero__desc">{tagline}</p>}
        </div>
      </section>

      {/* ── 2. Structured Content Modules (Reference Design Layout) ── */}
      <div className="service-modules-container">
        {modules.map((mod, idx) => {
          const isAltBackground = idx % 2 !== 0;
          const isImageRight =
            mod.imagePosition === 'right' || (mod.imagePosition === undefined && idx % 2 !== 0);

          return (
            <section
              key={mod.id || idx}
              className={`service-module-section ${
                isAltBackground ? 'service-module-section--alt' : ''
              }`}
            >
              <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div className="service-module-grid">
                  {/* Left Column (Image if left, Content if image is right) */}
                  <div
                    style={{
                      order: isImageRight ? 2 : 1,
                    }}
                  >
                    <div className="service-module__img-wrapper">
                      <img
                        src={mod.image || '/images/Boston-Luxury-Chauffeur.webp'}
                        alt={mod.heading}
                        className="service-module__img"
                        loading="lazy"
                      />
                    </div>
                  </div>

                  {/* Right Column (Content if left, Image if image is right) */}
                  <div
                    className="service-module__content"
                    style={{
                      order: isImageRight ? 1 : 2,
                    }}
                  >
                    {/* Gold Circular Badge Icon */}
                    <div className="service-module__icon-badge">
                      <Check className="w-6 h-6 stroke-[3]" />
                    </div>

                    {/* Section Heading */}
                    <h2 className="service-module__heading">{mod.heading}</h2>

                    {/* Bullet List */}
                    {mod.bullets && mod.bullets.length > 0 && (
                      <div className="service-module__bullets">
                        {mod.bullets.map((bullet, bIdx) => (
                          <div key={bIdx} className="service-module__bullet-item">
                            <div className="service-module__bullet-icon">
                              <Check className="w-5 h-5 stroke-[2.5]" />
                            </div>
                            <div className="service-module__bullet-text">
                              <span className="service-module__bullet-title">
                                {bullet.title}:
                              </span>
                              <span>{bullet.description}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Dual Action Buttons */}
                    <div className="service-module__cta-row">
                      <Link
                        href={`/book?service=${currentSlug}`}
                        className="service-module__btn-reserve"
                      >
                        <span>Book Now</span>
                        <ArrowRight size={16} />
                      </Link>

                      <a href="tel:16177840264" className="service-module__btn-phone">
                        <Phone size={15} />
                        <span>(617) 784-0264</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
