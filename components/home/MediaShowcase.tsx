import React from 'react';

export default function MediaShowcase() {
  return (
    <section
      className="media-showcase-section section-pad"
      style={{ backgroundColor: 'var(--clr-bg)', paddingTop: 0 }}
      aria-label="Experience Showcase"
    >
      <div className="container">
        <div className="media-showcase-grid">
          {/* Left Item: Passenger View */}
          <div className="media-showcase-card">
            <img
              src="/images/Limousine-Service-e1763051925488.webp"
              alt="Luxury Chauffeur Service Passenger View"
              loading="lazy"
            />
            <div className="media-showcase-overlay">
              <span className="media-showcase-tag">Luxury Experience</span>
            </div>
          </div>

          {/* Right Item: Stretch Limousine */}
          <div className="media-showcase-card">
            <img
              src="/images/blc89.webp"
              alt="White Stretch Limousine Service"
              loading="lazy"
            />
            <div className="media-showcase-overlay">
              <span className="media-showcase-tag">Premium Stretch Fleet</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
