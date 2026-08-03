import React from 'react';
import Image from 'next/image';
import { Phone, ShieldCheck, Clock, Award, Star } from 'lucide-react';
import BookingForm from '@/components/forms/BookingForm';
import { prisma } from '@/lib/prisma';

export const metadata = {
  title: 'Instant Rate Quote & Reservation | GM Limo Services Boston',
  description: 'Book your executive chauffeur or airport transfer online in under 60 seconds. Guaranteed flat rates and 24/7 live dispatch confirmation.',
};

export default async function BookPage() {
  let settings = {
    phoneDisplay: '(617) 784-0264',
    phoneTel: '16177840264',
  };

  try {
    const dbSettings = await prisma.siteSetting.findUnique({
      where: { id: 'default' },
    });
    if (dbSettings) {
      settings = {
        phoneDisplay: dbSettings.phoneDisplay || settings.phoneDisplay,
        phoneTel: dbSettings.phoneTel || settings.phoneTel,
      };
    }
  } catch (e) {
    console.error('Error fetching settings for book page:', e);
  }

  return (
    <div className="contact-page-wrap">
      {/* ── Page Banner / Hero ───────────────────────────────────── */}
      <section className="contact-hero">
        <div className="contact-hero__bg">
          <Image
            src="/images/Boston-Luxury-Chauffeur.webp"
            alt="GM Limo Services Dispatch"
            fill
            priority
            className="contact-hero__img"
          />
          <div className="contact-hero__overlay"></div>
        </div>

        <div className="container contact-hero__content">
          <span className="eyebrow eyebrow--gold">24/7 ONLINE RESERVATION</span>
          <h1 className="contact-hero__title">Instant Quote &amp; Booking</h1>
          <p className="contact-hero__lead">
            Select your route, choose from our luxury executive fleet, and receive guaranteed fixed pricing with 24/7 dispatch confirmation.
          </p>
        </div>
      </section>

      {/* ── Main Section ───────────────────────────────────────── */}
      <section className="contact-main section-pad">
        <div className="container">
          <div className="contact-grid">
            {/* Left Column: Form */}
            <div className="contact-form-card">
              <div className="contact-form-card__header">
                <span className="eyebrow">Online Reservation</span>
                <h2>Reserve Your Service</h2>
                <p>
                  Complete the 3 quick steps below to lock in your vehicle with instant dispatch notification.
                </p>
              </div>

              <BookingForm />
            </div>

            {/* Right Column: Info Cards & Benefits */}
            <div className="contact-info-col">
              {/* Direct Contact Card */}
              <div className="contact-info-card">
                <h3 className="contact-info-card__title">Need Urgent Assistance?</h3>

                <div className="contact-info-list">
                  <a href={`tel:${settings.phoneTel}`} className="contact-info-item">
                    <div className="contact-info-item__icon">
                      <Phone size={20} />
                    </div>
                    <div className="contact-info-item__text">
                      <span className="contact-info-item__label">24/7 Dispatch Desk</span>
                      <span className="contact-info-item__value">{settings.phoneDisplay}</span>
                    </div>
                  </a>

                  <div className="contact-info-item">
                    <div className="contact-info-item__icon">
                      <Clock size={20} />
                    </div>
                    <div className="contact-info-item__text">
                      <span className="contact-info-item__label">Instant Confirmation</span>
                      <span className="contact-info-item__value">Dispatch response in 15 mins</span>
                    </div>
                  </div>

                  <div className="contact-info-item">
                    <div className="contact-info-item__icon">
                      <ShieldCheck size={20} />
                    </div>
                    <div className="contact-info-item__text">
                      <span className="contact-info-item__label">Guaranteed Pricing</span>
                      <span className="contact-info-item__value">No surge pricing or surprise fees</span>
                    </div>
                  </div>

                  <div className="contact-info-item">
                    <div className="contact-info-item__icon">
                      <Award size={20} />
                    </div>
                    <div className="contact-info-item__text">
                      <span className="contact-info-item__label">Flight Tracking</span>
                      <span className="contact-info-item__value">Complimentary wait time included</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Guarantee Box */}
              <div
                style={{
                  backgroundColor: 'rgba(15, 23, 42, 0.65)',
                  border: '1px solid rgba(197, 164, 109, 0.25)',
                  borderRadius: '16px',
                  padding: '1.75rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#c5a46d', marginBottom: '0.75rem' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="#c5a46d" />
                  ))}
                </div>
                <h4 style={{ color: '#ffffff', fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                  The GM Limo Guarantee
                </h4>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.6, margin: 0 }}>
                  We monitor all arriving flight tail numbers in real-time. Whether your flight lands early or is delayed, your chauffeur will be waiting at Logan airport inside or curbside when you exit.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
