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
              src="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&h=500&q=80"
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
              src="https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&h=500&q=80"
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
