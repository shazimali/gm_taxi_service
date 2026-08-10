'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';

interface VehicleItem {
  name: string;
  model: string;
  image: string;
  pax: number;
  luggage: number;
  slug?: string;
  features: string[];
}

export default function FleetSlider({ fleet }: { fleet: VehicleItem[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // 3 products per view on desktop
  const totalPages = Math.ceil(fleet.length / 3) || 1;

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    if (clientWidth > 0) {
      const newIdx = Math.round(scrollLeft / clientWidth);
      setActiveIndex(Math.min(newIdx, totalPages - 1));
    }
  };

  const scrollToSlide = (index: number) => {
    if (!scrollRef.current) return;
    const clientWidth = scrollRef.current.clientWidth;
    scrollRef.current.scrollTo({
      left: index * clientWidth,
      behavior: 'smooth',
    });
  };

  const scrollLeft = () => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: -scrollRef.current.clientWidth,
      behavior: 'smooth',
    });
  };

  const scrollRight = () => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: scrollRef.current.clientWidth,
      behavior: 'smooth',
    });
  };

  return (
    <>
      <div
        className="fleet-grid"
        ref={scrollRef}
        onScroll={handleScroll}
        role="list"
      >
        {fleet.map((vehicle, idx) => {
          const vehicleSlug =
            vehicle.slug ||
            vehicle.name
              .toLowerCase()
              .replace(/[^a-z0-9-]/g, '-')
              .replace(/-+/g, '-');

          return (
            <article key={idx} className="vehicle-card" role="listitem">
              <div className="vehicle-card__thumb">
                <div className="vehicle-card__ribbon" aria-hidden="true" />
                <img src={vehicle.image} alt={vehicle.name} loading="lazy" />
              </div>

              <div className="vehicle-card__body">
                <h3 className="vehicle-card__name">{vehicle.name}</h3>
                <p className="vehicle-card__model">{vehicle.model}</p>

                <ul className="vehicle-features">
                  <li>{vehicle.pax} Passengers</li>
                  <li>{vehicle.luggage} Luggage Bags</li>
                  {vehicle.features.slice(0, 2).map((feat, fIdx) => (
                    <li key={fIdx}>{feat}</li>
                  ))}
                </ul>

                <div className="vehicle-card__actions">
                  <Link
                    href={`/book?vehicle=${vehicleSlug}`}
                    className="btn btn--gold"
                  >
                    Reserve Now
                  </Link>
                  <Link
                    href={`/fleet/${vehicleSlug}`}
                    className="btn btn--ghost"
                  >
                    View Specs
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Slider Controls */}
      <div className="fleet-slider-controls">
        <button
          type="button"
          className="fleet-slider-btn"
          onClick={scrollLeft}
          aria-label="Previous Slide"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <div className="fleet-slider-dots">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              type="button"
              className={`fleet-slider-dot ${activeIndex === i ? 'is-active' : ''}`}
              onClick={() => scrollToSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        <button
          type="button"
          className="fleet-slider-btn"
          onClick={scrollRight}
          aria-label="Next Slide"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </>
  );
}
