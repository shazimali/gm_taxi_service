export interface ServiceItem {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  icon: string;
  badge: string;
  image: string;
  shortDesc: string;
  fullDesc: string;
  benefits: string[];
  keyFeatures: string[];
}

export const SERVICES_DATA: ServiceItem[] = [
  {
    id: 'airport-transfers',
    slug: 'airport-transfers',
    title: 'Airport Transportation & Transfers',
    tagline: 'Stress-free, 24/7 transfers for Logan (BOS), TF Green (PVD), Hanscom (BED) & Regional Airports.',
    icon: '✈️',
    badge: 'Airport Chauffeur',
    image: '/images/Boston-Luxury-Chauffeur.webp',
    shortDesc: 'Seamless Logan, TF Green, Manchester & Providence airport transfers with real-time flight monitoring and complimentary wait time.',
    fullDesc: 'Navigating airport traffic, parking, and terminal delays can disrupt your schedule. GM Limo Services provides precision airport chauffeur service across all major New England airports including Boston Logan International (BOS), Providence TF Green (PVD), Manchester-Boston (MHT), and Hanscom Field (BED). Your dedicated chauffeur tracks your flight status live, adjusts pickup time for early or delayed arrivals, and meets you inside baggage claim or at curbside limo pickup areas.',
    benefits: [
      '60 Minutes Complimentary Airport Wait Time',
      'Live Flight Status Tracking & Automated Adjustment',
      'Choice of Curbside Pickup or Baggage Claim Meet & Greet',
      'Assistance with Luggage Handling',
      'Fixed All-Inclusive Pricing (No Hidden Tolls or Fees)',
    ],
    keyFeatures: [
      '24/7 Dispatch Desk Monitoring',
      'Flight Tail Number Tracking',
      'Luxury Sedans, Escalades & Sprinters',
      'Uniformed Professional Chauffeurs',
    ],
  },
  {
    id: 'hourly-chauffeur',
    slug: 'hourly-chauffeur',
    title: 'Hourly Private Chauffeur',
    tagline: 'Dedicated vehicle and chauffeur at your service for complete schedule flexibility.',
    icon: '🕐',
    badge: 'By The Hour',
    image: '/images/Hourly-Chayffeur-Service-e1763051109937.jpe',
    shortDesc: 'Book a dedicated chauffeur by the hour — ideal for roadshows, multi-stop corporate errands, and city-wide VIP escort.',
    fullDesc: 'When your day demands multiple stops, shifting agendas, or unpredictable meeting durations, our By-The-Hour (As Directed) service offers ultimate flexibility. Your private chauffeur remains on standby at every location, ensuring instant departure when you step out. No waiting for ride-share apps or worrying about parking in downtown Boston.',
    benefits: [
      'Flexible Multi-Stop Itineraries',
      'Chauffeur Remains on Standby Between Stops',
      'Keep Personal Belongings Securely in Vehicle',
      'Hourly Rates with Zero Surge Multipliers',
      'Ideal for Corporate Roadshows & Special Occasions',
    ],
    keyFeatures: [
      'Minimum 2 to 3 Hour Blocks',
      'Direct Chauffeur Mobile Contact',
      'Customized Refreshments on Request',
      'Tailored Route Optimization',
    ],
  },
  {
    id: 'point-to-point',
    slug: 'point-to-point',
    title: 'Long Distance City-to-City Transfer',
    tagline: 'Comfortable, private non-stop travel between Boston, NYC, Providence, and across New England.',
    icon: '🗺️',
    badge: 'Long Distance',
    image: '/images/City-to-City-Transfer-e1763051857279.webp',
    shortDesc: 'Flat-rate city-to-city rides between Boston, New York, Providence, Hartford & beyond — no surge pricing, ever.',
    fullDesc: 'Skip crowded regional flights, train delays, and security lines. Our City-to-City long-distance chauffeur service transforms travel time into productive or relaxing hours. Work comfortably with onboard Wi-Fi and power outlets or sleep peacefully while your expert driver handles interstate traffic.',
    benefits: [
      'Door-to-Door Private Express Travel',
      'Zero TSA Queue & Zero Airport Waiting',
      'Productive Mobile Office Environment',
      'All-Weather AWD SUV Fleet Available',
      'Fixed Flat Rates Guaranteed at Booking',
    ],
    keyFeatures: [
      'Boston ↔ Manhattan NYC Express',
      'Boston ↔ Cape Cod & Islands Shuttles',
      'Boston ↔ Newport & Providence',
      'Boston ↔ Connecticut & New Jersey',
    ],
  },
  {
    id: 'corporate-accounts',
    slug: 'corporate-accounts',
    title: 'Luxury Chauffeur & Limousine',
    tagline: 'Bespoke corporate mobility solutions with consolidated billing and priority dispatch.',
    icon: '🚘',
    badge: 'VIP Service',
    image: '/images/Limousine-Service-e1763051925488.webp',
    shortDesc: 'White-glove chauffeur service in late-model Lincoln Continentals, Cadillac CT6s, and Escalade ESVs.',
    fullDesc: 'GM Limo Services partners with leading corporations, venture capital firms, law firms, and biotech leaders throughout Greater Boston and Cambridge. We offer dedicated account management, customized invoicing, duty-of-care compliance, and guaranteed vehicle availability for corporate accounts.',
    benefits: [
      'Centralized Monthly Billing & Expense Reporting',
      'Priority Fleet Dispatch Guarantee',
      'NDAs & Strict Confidentiality Agreements',
      'Dedicated Account Coordinator',
      'Custom Executive Service Preferences',
    ],
    keyFeatures: [
      'Duty of Care Compliance',
      'Flight & Train Manifest Management',
      'Roadshow Logistics Supervision',
      'Corporate Discount Structure',
    ],
  },
  {
    id: 'event-limo',
    slug: 'event-limo',
    title: 'Event Limo Service',
    tagline: 'Galas, concerts, sporting events, and corporate dinners.',
    icon: '🎭',
    badge: 'Special Event',
    image: '/images/Event-Transportation-e1763052056749.webp',
    shortDesc: 'Galas, concerts, sporting events, and corporate dinners — arrive on time, in style, without the parking hassle.',
    fullDesc: 'Make a grand entrance at your next concert, gala, championship game, or night on the town. Our event chauffeur service eliminates parking worries, traffic navigation, and designated driver logistics.',
    benefits: [
      'Door-to-Door Venue Drop-Off',
      'Chauffeur Standby for Post-Event Departure',
      'Group Seating Accommodations in Sprinter Vans',
      'Ice Bucket Refreshment Setup',
      'Guaranteed On-Time Arrival',
    ],
    keyFeatures: [
      'Fenway Park & TD Garden Concert Shuttles',
      'Gala & Fundraiser Transportation',
      'VIP Night Out Logistics',
      'Custom Itinerary Scheduling',
    ],
  },
  {
    id: 'weddings-special-events',
    slug: 'weddings-special-events',
    title: 'Private Wedding Limo',
    tagline: 'Flawless wedding party transportation, luxury stretch limos, and guest group shuttles.',
    icon: '💍',
    badge: 'Weddings',
    image: '/images/Wedding-Limo-Service-e1763052179994.webp',
    shortDesc: 'Bespoke bridal transportation packages — rehearsal dinner through send-off, coordinated to the minute.',
    fullDesc: 'Your wedding day or milestone gala deserves perfection down to every detail. From transporting the bride and groom in an immaculate stretch limousine to organizing scheduled guest shuttles between hotels, ceremony sites, and reception venues, GM Limo Services ensures seamless event logistics.',
    benefits: [
      'Red Carpet Service & White-Glove Touch',
      'Chilled Ice Bar with Champagne Glasses',
      'Coordinated Multi-Vehicle Fleet Logistics',
      'Flexible Rehearsal Dinner & Send-Off Packages',
      'On-Site Transportation Dispatch Coordinator',
    ],
    keyFeatures: [
      'Bespoke Bridal Party Packages',
      'Guest Shuttle Sprinter Vans',
      'Photo Stop Flexibility',
      'Decor & Ribbon Customization',
    ],
  },
];
