import React from 'react';

export default function Testimonials() {
  const reviews = [
    {
      author: 'Sarah M.',
      meta: 'Boston, MA · Airport Transfer',
      quote:
        'The driver was waiting for me in baggage claim with a sign — even though my flight landed 40 minutes early. Immaculate car, ice-cold water in the armrest, and he had the Red Sox game on at the perfect volume. Will use every time.',
      initials: 'SM',
    },
    {
      author: 'David L.',
      meta: 'Cambridge, MA · Corporate Account',
      quote:
        'Our company has been using GM Limo for three years for client pickups and executive travel. The professionalism is consistently excellent. Billing is transparent, drivers are discreet, and the vehicles are always pristine.',
      initials: 'DL',
    },
    {
      author: 'Jennifer & Thomas R.',
      meta: 'Newton, MA · Wedding Day',
      quote:
        'They coordinated our entire wedding transportation flawlessly — bridal party, parents, and guests between the church and venue. On time to the minute, stunning stretch limo, and the driver even helped bustle my dress. Absolute perfection.',
      initials: 'JT',
    },
  ];

  return (
    <section className="testimonials-section section-pad" id="testimonials" aria-labelledby="testimonials-heading">
      <div className="container">
        <header className="testimonials-section__header">
          <span className="eyebrow">Client Reviews</span>
          <h2 id="testimonials-heading">What Our Customers Are Saying</h2>
        </header>

        {/* Grid: 1 col → 2 col → 3 col */}
        <div className="testimonials-grid" role="list">
          {reviews.map((rev, idx) => (
            <article key={idx} className="review-card" role="listitem">
              <div className="review-stars" role="img" aria-label="5 out of 5 stars">
                <span aria-hidden="true">★</span>
                <span aria-hidden="true">★</span>
                <span aria-hidden="true">★</span>
                <span aria-hidden="true">★</span>
                <span aria-hidden="true">★</span>
                <span className="sr-only">5 out of 5 stars</span>
              </div>

              <blockquote className="review-quote">{rev.quote}</blockquote>

              <footer className="review-author">
                <div className="review-author__avatar" aria-hidden="true">
                  {rev.initials}
                </div>
                <div className="review-author__info">
                  <span className="review-author__name">{rev.author}</span>
                  <span className="review-author__meta">{rev.meta}</span>
                </div>
              </footer>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
