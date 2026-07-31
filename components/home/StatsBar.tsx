import React from 'react';
import Link from 'next/link';

export default function StatsBar() {
  const stats = [
    {
      value: '15+',
      label: 'Serving Boston and New England with five-star chauffeur experiences since 2009.',
      icon: <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
    },
    {
      value: 'Real-Time Flight Tracking',
      label: 'We monitor every flight automatically — your chauffeur adjusts for early arrivals and delays.',
      icon: <><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/><path d="M14.05 2a9 9 0 018 7.94"/><path d="M14.05 6A5 5 0 0118 10"/></>,
    },
    {
      value: 'Transparent Pricing',
      label: 'One flat rate quoted upfront — no surge fees, no meter surprises, no gratuity games.',
      icon: <><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></>,
    },
  ];

  return (
    <section className="stats-section section-pad" id="stats-bar" aria-labelledby="stats-heading">
      <div className="container stats-section__inner">
        <header className="stats-section__header">
          <span className="eyebrow">Our Promise</span>
          <h2 id="stats-heading">The Gold Standard in Boston Transportation</h2>
        </header>

        {/* 3-column stat blocks */}
        <div className="stats-row" role="list">
          {stats.map((item, idx) => (
            <div key={idx} className="stat-block" role="listitem">
              <div className="stat-block__icon" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  {item.icon}
                </svg>
              </div>

              <div className="stat-block__value">{item.value}</div>
              <p className="stat-block__label">{item.label}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="stats-section__cta">
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
            Book Your Chauffeur
          </Link>
          <a
            href="tel:16177840264"
            className="btn btn--ghost"
            aria-label="Call us at (617) 784-0264"
          >
            Or Call Us <strong>(617) 784-0264</strong>
          </a>
        </div>
      </div>
    </section>
  );
}
