import Image from 'next/image';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { resolveAboutContent } from '@/lib/aboutDefaults';
import { getAboutIcon } from '@/lib/aboutIcons';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'About Us | GM Limo Services Boston',
  description:
    'Learn about GM Limo Services — Boston’s premier executive luxury chauffeur company with 15+ years of operational excellence.',
};

export default async function AboutUsPage() {
  const dbContent = await prisma.aboutContent
    .findUnique({ where: { id: 'default' } })
    .catch(() => null);

  const c = resolveAboutContent(dbContent);

  const heroBg = `linear-gradient(rgba(17, 17, 17, 0.65), rgba(17, 17, 17, 0.65)), url('${c.heroImage}')`;
  const statsBg = c.statsImage
    ? `linear-gradient(rgba(17, 17, 17, 0.85), rgba(17, 17, 17, 0.85)), url('${c.statsImage}')`
    : undefined;
  const cta1Bg = `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('${c.cta1Image}')`;
  const cta2Bg = `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('${c.cta2Image}')`;

  return (
    <main className="about-us-page">
      {/* 1. Hero Banner */}
      <section className="about-us-hero" style={{ backgroundImage: heroBg }}>
        <div className="about-us-hero__inner">
          <span className="about-section-tag" style={{ color: '#f5e4ab' }}>
            {c.heroTag}
          </span>
          <h1 className="about-us-hero__title">{c.heroTitle}</h1>
          <p className="about-us-hero__desc">{c.heroDesc}</p>
        </div>
      </section>

      {/* 2. Who We Are / Company Overview */}
      <section className="section-padding" style={{ backgroundColor: 'var(--clr-bg)' }}>
        <div className="container">
          <div className="about-who-layout">
            <div>
              <span className="about-section-tag">{c.whoTag}</span>
              <h2 className="about-section-title">
                {c.whoTitlePrefix} <span className="gold-gradient-text">{c.whoTitleHighlight}</span>
              </h2>
              <p className="about-section-desc">{c.whoDesc}</p>
              <div className="about-who-text">
                <p style={{ marginBottom: '1rem' }}>{c.whoText1}</p>
                <p>{c.whoText2}</p>
              </div>

              {/* Feature Boxes */}
              <div className="about-feature-boxes" style={{ marginTop: '2.5rem' }}>
                {c.featureBoxes.map((box, idx) => {
                  const Icon = getAboutIcon(box.icon);
                  return (
                    <div className="about-feature-box" key={idx}>
                      <div className="about-feature-box__icon">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="about-feature-box__title">{box.title}</h3>
                        <p className="about-feature-box__desc">{box.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Portrait Image Column */}
            <div>
              <div className="about-portrait-wrapper" style={{ position: 'relative', height: '480px' }}>
                <Image
                  src={c.whoImage}
                  alt="GM Limo Chauffeurs"
                  fill
                  className="about-portrait-img"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Core Pillars / Services Grid Overview */}
      <section className="section-padding" style={{ backgroundColor: 'var(--clr-bg-alt)', borderTop: '1px solid var(--clr-border)', borderBottom: '1px solid var(--clr-border)' }}>
        <div className="container">
          <div className="text-center" style={{ maxWidth: '750px', margin: '0 auto 3.5rem' }}>
            <span className="about-section-tag">{c.pillarsTag}</span>
            <h2 className="about-section-title">{c.pillarsTitle}</h2>
            <p style={{ color: 'var(--clr-text-muted)', fontSize: '1.05rem', lineHeight: '1.6' }}>
              {c.pillarsDesc}
            </p>
          </div>

          <div className="about-fleet-features">
            {c.pillars.map((pillar, idx) => (
              <div className="about-fleet-feat" key={idx}>
                <h3 className="about-fleet-feat__title">{pillar.title}</h3>
                <p className="about-fleet-feat__desc">{pillar.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Stats Counter Section */}
      <section
        className="about-stats-counter"
        style={statsBg ? { backgroundImage: statsBg } : undefined}
      >
        <div className="container text-center">
          <span className="about-section-tag" style={{ color: '#f5e4ab' }}>
            {c.statsTag}
          </span>
          <h2 className="about-stats-header">{c.statsHeader}</h2>

          <div className="about-counter-grid">
            {c.stats.map((stat, idx) => (
              <div className="about-counter-box" key={idx}>
                <div className="about-counter-val">{stat.value}</div>
                <div className="about-counter-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Dual CTA Section */}
      <section className="about-dual-cta" style={{ backgroundColor: 'var(--clr-bg)' }}>
        <div className="container">
          <div className="about-cta-grid">
            {/* Card 1 */}
            <div className="about-cta-card" style={{ backgroundImage: cta1Bg }}>
              <div className="about-cta-card__content">
                <span className="about-section-tag" style={{ color: '#f5e4ab' }}>
                  {c.cta1Tag}
                </span>
                <h3 className="about-cta-card__title">{c.cta1Title}</h3>
                <Link href={c.cta1BtnLink} className="btn btn-primary" style={{ textTransform: 'uppercase' }}>
                  {c.cta1BtnText}
                </Link>
              </div>
            </div>

            {/* Card 2 */}
            <div className="about-cta-card" style={{ backgroundImage: cta2Bg }}>
              <div className="about-cta-card__content">
                <span className="about-section-tag" style={{ color: '#f5e4ab' }}>
                  {c.cta2Tag}
                </span>
                <h3 className="about-cta-card__title">{c.cta2Title}</h3>
                <Link href={c.cta2BtnLink} className="btn btn-outline-white" style={{ textTransform: 'uppercase' }}>
                  {c.cta2BtnText}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
