import React from 'react';

export default function WhyChooseUs() {
  const features = [
    {
      title: 'Safety First',
      text: 'All chauffeurs are licensed, background-checked, and trained to the highest professional standards.',
      icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
    },
    {
      title: 'Reasonable Rates',
      text: 'Flat, all-inclusive fares with no hidden fees — guaranteed before you book, not after.',
      icon: (
        <>
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
        </>
      ),
    },
    {
      title: 'Largest Fleet',
      text: 'Sedans, executive SUVs, stretch limos, and sprinter vans — the right vehicle for every occasion.',
      icon: (
        <>
          <rect x="1" y="3" width="15" height="13" rx="2" />
          <path d="M16 8h4l3 5v3h-7V8z" />
          <circle cx="5.5" cy="18.5" r="2.5" />
          <circle cx="18.5" cy="18.5" r="2.5" />
        </>
      ),
    },
    {
      title: 'Luxury Service',
      text: 'From the first greeting to the final drop-off, every detail is handled with white-glove precision.',
      icon: <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />,
    },
  ];

  return (
    <section className="why-section section-pad" id="why-choose-us" aria-labelledby="why-heading">
      <div className="container">
        <header className="why-section__header">
          <span className="eyebrow">Why GM Limo Services</span>
          <h2 id="why-heading">Make Your Trip Your Way With Us</h2>
          <p className="why-section__lead">
            We combine professional-grade reliability with the comfort and discretion you expect from a premium chauffeur service.
          </p>
        </header>

        <div className="why-grid" role="list">
          {features.map((item, idx) => (
            <div key={idx} className="why-card" role="listitem">
              <div className="why-card__icon" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  {item.icon}
                </svg>
              </div>

              <h3 className="why-card__title">{item.title}</h3>
              <p className="why-card__text">{item.text}</p>
            </div>
          ))}
        </div>

        {/* Trust logos / rating badges bar */}
        <div className="trust-logos-divider" aria-hidden="true"></div>

        <div className="trust-logos-bar">
          {/* Google */}
          <div className="trust-badge">
            <span className="trust-badge__brand google-brand">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114A5.57 5.57 0 018.4 12.943a5.57 5.57 0 015.59-5.572c2.25 0 3.977 1.05 4.773 1.81l3.227-3.227C20.023 4.088 17.272 2.7 13.99 2.7 8.318 2.7 3.7 7.318 3.7 13s4.618 10.3 10.29 10.3c5.932 0 10.01-4.173 10.01-10.186 0-.682-.068-1.2-.205-1.83H12.24z"/>
              </svg>
              Google
            </span>
            <div className="trust-badge__stars">
              <span className="star-color">★★★★★</span> <span className="trust-badge__rating">4.9/5</span>
            </div>
          </div>

          {/* Yelp */}
          <div className="trust-badge">
            <span className="trust-badge__brand yelp-brand">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M12.01 17.653c-.347-.07-.468-.135-.615-.49a15.776 15.776 0 01-.692-2.316c-.053-.294.062-.437.362-.397 1.134.15 2.274.225 3.407.31.393.03.524.21.436.6-.178.788-.415 1.564-.67 2.33-.11.328-.27.397-.597.354-.537-.07-1.077-.113-1.631-.391zm-.915-5.918c-.287.054-.366.19-.345.452.128 1.58.261 3.161.41 4.738.03.32-.083.475-.385.586a14.286 14.286 0 01-2.527.702c-.378.071-.52-.088-.503-.453.04-.847.164-1.683.33-2.513.06-.302-.008-.475-.316-.583-.73-.255-1.425-.572-2.125-.91-.322-.156-.37-.315-.22-.613.364-.72.784-1.405 1.236-2.07.2-.294.385-.297.632-.11.758.574 1.568 1.05 2.4 1.488.243.128.435.07.525-.192.176-.51.343-1.025.5-1.54.12-.396.284-.455.637-.282.809.398 1.597.839 2.355 1.336.275.18.257.365.04.577a17.2 17.2 0 01-1.677 1.433c-.23.16-.275.32-.193.593.18.598.375 1.19.584 1.78.118.337.037.49-.304.575a13.385 13.385 0 01-2.482.493c-.352.036-.453-.133-.427-.478.117-1.547.218-3.097.33-4.646l.006-.051z"/>
              </svg>
              Yelp
            </span>
            <div className="trust-badge__stars">
              <span className="star-color">★★★★★</span> <span className="trust-badge__rating">5.0/5</span>
            </div>
          </div>

          {/* BBB */}
          <div className="trust-badge">
            <span className="trust-badge__brand bbb-brand">
              <span className="bbb-logo">BBB</span> Accredited
            </span>
            <span className="bbb-grade">A+</span>
          </div>

          {/* TripAdvisor */}
          <div className="trust-badge">
            <span className="trust-badge__brand ta-brand">Tripadvisor</span>
            <div className="trust-badge__stars">
              <span className="star-color">★★★★★</span>
            </div>
          </div>

          {/* Trustpilot */}
          <div className="trust-badge">
            <span className="trust-badge__brand tp-brand">Trustpilot</span>
            <div className="trust-badge__stars">
              <span className="star-color">★★★★★</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
