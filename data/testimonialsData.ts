export interface TestimonialItem {
  id: string;
  author: string;
  titleRole: string;
  rating: number;
  content: string;
  date: string;
  location: string;
  avatarInitials: string;
}

export const TESTIMONIALS_DATA: TestimonialItem[] = [
  {
    id: 'test-1',
    author: 'Michael R.',
    titleRole: 'Managing Director, Biotech Firm',
    rating: 5,
    content: 'GM Limo Services is our go-to chauffeur team in Boston. Always 10 minutes early, pristine Escalades, and effortless flight tracking for Logan BOS airport pickups.',
    date: 'July 2026',
    location: 'Boston, MA',
    avatarInitials: 'MR',
  },
  {
    id: 'test-2',
    author: 'Sarah Jenkins',
    titleRole: 'Event & Wedding Planner',
    rating: 5,
    content: 'We hired their Sprinter Van and Stretch Limo for a 150-guest wedding in Newport. The coordination was flawless, drivers were immaculate, and the bride felt like royalty.',
    date: 'June 2026',
    location: 'Newport, RI',
    avatarInitials: 'SJ',
  },
  {
    id: 'test-3',
    author: 'David L.',
    titleRole: 'Corporate Travel Lead',
    rating: 5,
    content: 'Superior service for our quarterly board meetings. Flat-rate pricing with zero surprise surcharges and seamless executive invoicing. Highly recommended!',
    date: 'May 2026',
    location: 'Cambridge, MA',
    avatarInitials: 'DL',
  },
  {
    id: 'test-4',
    author: 'Elena Rostova',
    titleRole: 'Private Traveler',
    rating: 5,
    content: 'Traveled from Boston to Manhattan in their Executive SUV. Smooth, fast, and far more relaxing than flying or taking Acela. The driver was professional and respectful.',
    date: 'April 2026',
    location: 'New York City, NY',
    avatarInitials: 'ER',
  },
];
