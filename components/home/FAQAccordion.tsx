import React from 'react';

export default function FAQAccordion() {
  const faqs = [
    {
      q: 'How much does airport transportation cost?',
      a: 'Our airport transfers feature fixed, all-inclusive flat rates based on your pick-up city and destination airport. Prices include tolls, airport fees, and standard wait times. Get an instant quote online via our Booking page or call us for pricing.',
    },
    {
      q: 'How far in advance should I book?',
      a: 'We recommend booking at least 24 to 48 hours in advance to guarantee vehicle availability. However, we do accept last-minute bookings subject to availability. Please call our dispatch line directly for immediate travel needs.',
    },
    {
      q: 'Do you track my flight?',
      a: 'Yes, we track all commercial incoming flights in real-time. Whether your flight arrives early or is delayed, your chauffeur will adjust their arrival time accordingly. You do not need to worry about updating us on flight changes.',
    },
    {
      q: "What happens if I'm delayed at the airport?",
      a: 'We offer complimentary wait time for all airport pickups: 30 minutes for domestic flights and 60 minutes for international flights, starting from the time the aircraft wheels touch down. If you need extra time for customs or baggage, just let us know.',
    },
    {
      q: 'Can I book hourly service for meetings and events?',
      a: 'Absolutely. Our hourly charter service gives you a dedicated vehicle and professional chauffeur for as long as you need. This is the ideal option for executive roadshows, multi-stop meetings, weddings, and special events.',
    },
    {
      q: 'Do you offer wedding transportation?',
      a: 'Yes, we provide luxury wedding transportation packages. From stretch limousines for the bridal party to executive vans and SUVs for guest shuttles, we coordinate every travel detail to make your special day seamless.',
    },
    {
      q: 'What cities do you serve?',
      a: 'Based in Boston, we serve the entire Greater Boston area, Massachusetts, and surrounding New England states (Rhode Island, New Hampshire, Connecticut, Maine, and Vermont). We regularly perform long-distance transfers to New York City.',
    },
    {
      q: 'Are your drivers professional and insured?',
      a: 'Yes, all of our chauffeurs are highly trained, fully licensed, background-checked, and subject to regular drug testing. Our entire fleet carries comprehensive commercial insurance coverage exceeding industry requirements.',
    },
    {
      q: 'Can I cancel or change my reservation?',
      a: 'Yes. Cancellations made at least 24 hours prior to the scheduled pickup time receive a full refund. Cancellations or changes made within 24 hours may be subject to a cancellation fee depending on the service type and vehicle booked.',
    },
    {
      q: 'How do you handle payment?',
      a: 'We accept all major credit cards (Visa, MasterCard, American Express, Discover) and corporate accounts. Fares are billed to the credit card on file upon completion of the trip. Corporate accounts can be configured for monthly invoicing.',
    },
  ];

  return (
    <section className="faq-section section-pad" id="faq" aria-labelledby="faq-heading">
      <div className="container">
        <header className="faq-section__header">
          <span className="eyebrow">Got Questions?</span>
          <h2 id="faq-heading">Frequently Asked Questions</h2>
        </header>

        {/* Accordion container */}
        <div className="faq-accordion">
          {faqs.map((faq, idx) => (
            <details key={idx} className="faq-item" open={idx === 0}>
              <summary className="faq-summary">
                <span>{faq.q}</span>
                <div className="faq-icon" aria-hidden="true"></div>
              </summary>
              <div className="faq-content">
                <p>{faq.a}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
