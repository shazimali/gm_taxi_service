export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'booking' | 'airport' | 'fleet' | 'pricing';
}

export const FAQ_DATA: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'How far in advance should I book my limo or airport transfer?',
    answer: 'We recommend booking at least 12 to 24 hours in advance to guarantee your preferred vehicle. However, our 24/7 dispatch desk also accepts same-day reservations subject to vehicle availability.',
    category: 'booking',
  },
  {
    id: 'faq-2',
    question: 'What happens if my flight is delayed or arrives early?',
    answer: 'We track your flight number in real time. If your flight is delayed or lands early, your chauffeur’s schedule automatically adjusts to match your actual landing time at zero additional cost.',
    category: 'airport',
  },
  {
    id: 'faq-3',
    question: 'Where will my chauffeur meet me at Boston Logan Airport (BOS)?',
    answer: 'For curbside pickup, your driver will text you upon landing and meet you at the designated Terminal Limousine Pickup Area once you have retrieved your luggage. We also offer Meet & Greet service inside baggage claim with a personalized name sign.',
    category: 'airport',
  },
  {
    id: 'faq-4',
    question: 'Are tolls, gratuity, and fuel surcharges included in the quoted rate?',
    answer: 'Yes! We believe in transparent, upfront pricing. All estimates include tolls, driver gratuity, and standard service fees so there are no unexpected surprises at the end of your trip.',
    category: 'pricing',
  },
  {
    id: 'faq-5',
    question: 'What is your cancellation policy?',
    answer: 'Sedan and SUV bookings can be canceled with zero fee up to 2 hours prior to scheduled pickup time. Stretch Limos and Executive Sprinter Vans require a 24-hour cancellation notice for full refund.',
    category: 'booking',
  },
  {
    id: 'faq-6',
    question: 'Are child safety seats (car seats / booster seats) available?',
    answer: 'Yes. Rear-facing infant seats, forward-facing toddler seats, and booster seats are available upon request when making your reservation.',
    category: 'fleet',
  },
  {
    id: 'faq-7',
    question: 'Do you offer corporate accounts and monthly invoicing?',
    answer: 'Absolutely. We manage corporate transportation accounts for companies across Greater Boston and Cambridge with consolidated monthly billing, itemized ride reports, and priority dispatch.',
    category: 'pricing',
  },
];
