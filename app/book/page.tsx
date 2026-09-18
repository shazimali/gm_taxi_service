import React from 'react';
import Image from 'next/image';
import BookingForm from '@/components/forms/BookingForm';

export const metadata = {
  title: 'Instant Rate Quote & Reservation | GM Limo Services Boston',
  description: 'Book your executive chauffeur or airport transfer online in under 60 seconds. Guaranteed flat rates and 24/7 live dispatch confirmation.',
};

export default function BookPage() {
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
          <div className="contact-form-card contact-form-card--full">
            <div className="contact-form-card__header">
              <span className="eyebrow">Online Reservation</span>
              <h2>Reserve Your Service</h2>
              <p>
                Complete the 3 quick steps below to lock in your vehicle with instant dispatch notification.
              </p>
            </div>

            <BookingForm />
          </div>
        </div>
      </section>
    </div>
  );
}
