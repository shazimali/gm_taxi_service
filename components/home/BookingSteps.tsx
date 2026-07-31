import React from 'react';
import Link from 'next/link';

export default function BookingSteps() {
  const steps = [
    {
      number: '1',
      title: 'Choose Your Service',
      desc: "Select from our fleet of luxury sedans, executive SUVs, stretch limousines, or sprinter vans. Tell us your pickup location, destination, date, and time — and we'll match you with the perfect vehicle and chauffeur for your journey.",
      icon: (
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      ),
    },
    {
      number: '2',
      title: 'Confirm Your Booking',
      desc: "Receive an instant confirmation with your flat-rate fare, chauffeur details, and vehicle information. No credit card surprises — your price is locked in the moment you book. We'll send a reminder 24 hours before your ride with live tracking.",
      icon: (
        <>
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </>
      ),
    },
    {
      number: '3',
      title: 'Enjoy Your Ride',
      desc: 'Your professionally dressed chauffeur will greet you at the door — or in the arrivals hall with a name board for airport pickups. Settle into a spotless, climate-controlled cabin with complimentary water and Wi-Fi, and leave the driving to us.',
      icon: (
        <>
          <circle cx="12" cy="12" r="10" />
          <path d="M8 14s1.5 2 4 2 4-2 4-2" />
          <line x1="9" y1="9" x2="9.01" y2="9" />
          <line x1="15" y1="9" x2="15.01" y2="9" />
        </>
      ),
    },
  ];

  return (
    <section className="booking-steps-section section-pad" id="how-to-book" aria-labelledby="steps-heading">
      <div className="container">
        <header className="booking-steps-section__header">
          <span className="eyebrow">Simple &amp; Fast</span>
          <h2 id="steps-heading">
            How to Book Your Boston Luxury Chauffeur in 3 Easy Steps
          </h2>
        </header>

        <ol className="steps-grid" role="list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {steps.map((st, idx) => (
            <li key={idx} className="step-card" role="listitem">
              <div className="step-card__number" aria-hidden="true">
                {st.number}
              </div>

              <div style={{ color: 'var(--clr-text-muted)', marginTop: '0.5rem' }} aria-hidden="true">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="28"
                  height="28"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {st.icon}
                </svg>
              </div>

              <h3 className="step-card__title">{st.title}</h3>
              <p className="step-card__desc">{st.desc}</p>
            </li>
          ))}
        </ol>

        {/* Dual CTA below steps */}
        <div className="booking-steps-section__cta">
          <Link href="/book" className="btn btn--primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              width="18"
              height="18"
              aria-hidden="true"
            >
              <path d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zm0 16H5V10h14v10zM5 8V6h14v2H5z" />
            </svg>
            Book Now — It's Free to Quote
          </Link>
          <a
            href="tel:16177840264"
            className="btn btn--ghost"
            aria-label="Call us at (617) 784-0264"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              width="18"
              height="18"
              aria-hidden="true"
            >
              <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" />
            </svg>
            Prefer to Call? <strong>(617) 784-0264</strong>
          </a>
        </div>
      </div>
    </section>
  );
}
