import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ShieldCheck,
  Award,
  Clock,
  Car,
} from 'lucide-react';

export const metadata = {
  title: 'About Us | GM Limo Services Boston',
  description:
    'Learn about GM Limo Services — Boston’s premier executive luxury chauffeur company with 15+ years of operational excellence.',
};

export default function AboutUsPage() {
  return (
    <main className="about-us-page">
      {/* 1. Hero Banner */}
      <section className="about-us-hero">
        <div className="about-us-hero__inner">
          <span className="about-section-tag" style={{ color: '#f5e4ab' }}>
            PROVEN EXCELLENCE IN BOSTON
          </span>
          <h1 className="about-us-hero__title">About GM Limo Services</h1>
          <p className="about-us-hero__desc">
            Setting the standard for executive mobility, luxury airport transfers, and private corporate transportation across Greater Boston and New England.
          </p>
        </div>
      </section>

      {/* 2. Who We Are / Company Overview */}
      <section className="section-padding" style={{ backgroundColor: 'var(--clr-bg)' }}>
        <div className="container">
          <div className="about-who-layout">
            <div>
              <span className="about-section-tag">OUR STORY & VISION</span>
              <h2 className="about-section-title">
                15+ Years of <span className="gold-gradient-text">Uncompromising Quality</span>
              </h2>
              <p className="about-section-desc">
                Founded on the principles of punctuality, discretion, and white-glove hospitality, GM Limo Services has grown into Boston’s preferred executive fleet provider.
              </p>
              <div className="about-who-text">
                <p style={{ marginBottom: '1rem' }}>
                  We serve Fortune 500 executives, biotech leaders, financial institutions, private event planners, and discerning travelers. Our 24/7 dispatch desk coordinates every detail — from live Logan airport flight tracking to custom onboard preferences.
                </p>
                <p>
                  Every journey with GM Limo Services is crafted to exceed expectations. Whether traveling for high-stakes business meetings, point-to-point transfers, or special celebrations, our late-model luxury vehicles and professional chauffeurs ensure seamless travel.
                </p>
              </div>

              {/* Feature Boxes */}
              <div className="about-feature-boxes" style={{ marginTop: '2.5rem' }}>
                <div className="about-feature-box">
                  <div className="about-feature-box__icon">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="about-feature-box__title">Safety First</h3>
                    <p className="about-feature-box__desc">
                      100% background-checked, DOT-certified, & fully insured chauffeurs.
                    </p>
                  </div>
                </div>

                <div className="about-feature-box">
                  <div className="about-feature-box__icon">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="about-feature-box__title">Always On Time</h3>
                    <p className="about-feature-box__desc">
                      Chauffeurs arrive 15 minutes before scheduled pickup time.
                    </p>
                  </div>
                </div>

                <div className="about-feature-box">
                  <div className="about-feature-box__icon">
                    <Car className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="about-feature-box__title">Executive Fleet</h3>
                    <p className="about-feature-box__desc">
                      Meticulously maintained Lincoln Navigators, Escalades & Sedans.
                    </p>
                  </div>
                </div>

                <div className="about-feature-box">
                  <div className="about-feature-box__icon">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="about-feature-box__title">Flat Transparent Rates</h3>
                    <p className="about-feature-box__desc">
                      All-inclusive pricing with zero hidden fees or surge pricing.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Portrait Image Column */}
            <div>
              <div className="about-portrait-wrapper" style={{ position: 'relative', height: '480px' }}>
                <Image
                  src="/images/about-drivers.jpg"
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
            <span className="about-section-tag">SERVICE COMMITMENT</span>
            <h2 className="about-section-title">The GM Luxury Standard</h2>
            <p style={{ color: 'var(--clr-text-muted)', fontSize: '1.05rem', lineHeight: '1.6' }}>
              We redefine ground transportation through rigorous chauffeur training, pristine vehicle maintenance, and personalized passenger care.
            </p>
          </div>

          <div className="about-fleet-features">
            <div className="about-fleet-feat">
              <h3 className="about-fleet-feat__title">Duty of Care</h3>
              <p className="about-fleet-feat__desc">
                Full commercial insurance coverage, background screening, and strict privacy protocols for every single trip.
              </p>
            </div>

            <div className="about-fleet-feat">
              <h3 className="about-fleet-feat__title">Logan Airport Mastery</h3>
              <p className="about-fleet-feat__desc">
                Real-time commercial flight tracking and designated pickup location routing for Terminals A, B, C, and E.
              </p>
            </div>

            <div className="about-fleet-feat">
              <h3 className="about-fleet-feat__title">White-Glove Hospitality</h3>
              <p className="about-fleet-feat__desc">
                Tailored climate settings, route preferences, luggage assistance, and optional quiet cabin mode upon request.
              </p>
            </div>

            <div className="about-fleet-feat">
              <h3 className="about-fleet-feat__title">24/7 Dispatch Desk</h3>
              <p className="about-fleet-feat__desc">
                Dedicated human support team available around the clock to handle last-minute updates and flight changes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Stats Counter Section */}
      <section
        className="about-stats-counter"
        style={{
          backgroundImage:
            "linear-gradient(rgba(17, 17, 17, 0.85), rgba(17, 17, 17, 0.85)), url('/images/Boston-Luxury-Chauffeur.webp')",
        }}
      >
        <div className="container text-center">
          <span className="about-section-tag" style={{ color: '#f5e4ab' }}>
            MILESTONES OF SUCCESS
          </span>
          <h2 className="about-stats-header">Trusted By Executives & Travelers Nationwide</h2>

          <div className="about-counter-grid">
            <div className="about-counter-box">
              <div className="about-counter-val">15+</div>
              <div className="about-counter-label">Years of Service</div>
            </div>

            <div className="about-counter-box">
              <div className="about-counter-val">50,000+</div>
              <div className="about-counter-label">Successful Rides</div>
            </div>

            <div className="about-counter-box">
              <div className="about-counter-val">99.8%</div>
              <div className="about-counter-label">On-Time Arrival Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Dual CTA Section */}
      <section className="about-dual-cta" style={{ backgroundColor: 'var(--clr-bg)' }}>
        <div className="container">
          <div className="about-cta-grid">
            {/* Card 1 */}
            <div
              className="about-cta-card"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('/images/Event-Transportation-e1763052056749.webp')",
              }}
            >
              <div className="about-cta-card__content">
                <span className="about-section-tag" style={{ color: '#f5e4ab' }}>
                  INDIVIDUAL & FAMILY TRAVEL
                </span>
                <h3 className="about-cta-card__title">Reserve Your Private Executive Chauffeur</h3>
                <Link href="/book" className="btn btn-primary" style={{ textTransform: 'uppercase' }}>
                  Book Online Now
                </Link>
              </div>
            </div>

            {/* Card 2 */}
            <div
              className="about-cta-card"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('/images/City-to-City-Transfer-e1763051857279.webp')",
              }}
            >
              <div className="about-cta-card__content">
                <span className="about-section-tag" style={{ color: '#f5e4ab' }}>
                  CORPORATE ACCOUNTS
                </span>
                <h3 className="about-cta-card__title">Need Custom Billing or Fleet Dispatch?</h3>
                <Link href="/contact" className="btn btn-outline-white" style={{ textTransform: 'uppercase' }}>
                  Contact Corporate Team
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
