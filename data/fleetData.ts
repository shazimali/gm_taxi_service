export interface Vehicle {
  id: string;
  name: string;
  slug: string;
  category: string;
  model: string;
  tagline: string;
  image: string;
  passengerCapacity: number;
  luggageCapacity: number;
  rateHourly?: number;
  features: string[];
  description: string;
  amenities: string[];
  ctaType: 'book' | 'quote' | 'both';
}

export const FLEET_DATA: Vehicle[] = [
  {
    id: 'executive-sedan',
    name: 'Business Class Sedan',
    slug: 'executive-sedan',
    category: 'Sedan',
    model: 'Lincoln Continental / Cadillac CT6',
    tagline: 'Refined luxury for corporate travelers and private airport transfers.',
    image: '/images/Businessedited-1024x526-1-e1751891182287.webp',
    passengerCapacity: 3,
    luggageCapacity: 2,
    rateHourly: 85,
    features: [
      'Leather Interior & Wi-Fi',
      '3 Passengers',
      '2 Large Suitcases',
      '2 Carry-on Bags',
    ],
    description: 'Our Executive Sedan is the gold standard for discreet, punctual corporate travel and solo or couple airport transfers. Features climate-controlled rear seating, power outlets, and whisper-quiet cabin acoustic insulation.',
    amenities: ['Leather Interior', 'Wi-Fi Access', 'Device Charging', 'Bottled Water', 'Climate Control', 'Flight Tracking'],
    ctaType: 'both',
  },
  {
    id: 'executive-suv',
    name: 'Executive SUV',
    slug: 'executive-suv',
    category: 'SUV',
    model: 'Cadillac Escalade / Chevy Suburban',
    tagline: 'Spacious all-weather luxury for executive groups, families, and roadshows.',
    image: '/images/suv.webp',
    passengerCapacity: 6,
    luggageCapacity: 5,
    rateHourly: 110,
    features: [
      'All-Wheel Drive Comfort',
      '6 Passengers',
      '5 Large Suitcases',
      '2 Carry-on Bags',
    ],
    description: 'Designed for executive travel, family vacations, or winter weather resilience in New England. Offers maximum legroom, captain chair seating, tinted privacy glass, and spacious luggage compartment.',
    amenities: ['Captain Chairs', 'AWD All-Weather', 'Extended Trunk Space', 'Privacy Glass', 'USB-C Ports', 'Premium Bose Audio'],
    ctaType: 'both',
  },
  {
    id: 'premium-escalade-esv',
    name: 'Premium Luxury SUV',
    slug: 'premium-escalade-esv',
    category: 'Flagship SUV',
    model: 'Cadillac Escalade ESV',
    tagline: 'The ultimate flagship SUV for VIP clientele, celebrities, and executive roadshows.',
    image: '/images/blc89.webp',
    passengerCapacity: 6,
    luggageCapacity: 5,
    rateHourly: 135,
    features: [
      'Cadillac Escalade ESV',
      '6 Passengers',
      '5 Large Suitcases + Extra Cargo',
      'VIP Entertainment System',
    ],
    description: 'The pinnacle of American luxury mobility. Featuring custom leather upholstery, dual rear entertainment displays, air ride suspension, and unrivaled road presence for high-profile Boston travel.',
    amenities: ['AKG Audio System', 'Dual OLED Screens', 'Panoramic Sunroof', 'Air Ride Suspension', 'Refrigerated Console', 'Chauffeur Partition Option'],
    ctaType: 'both',
  },
  {
    id: 'stretch-limousine',
    name: 'Stretch Limousine',
    slug: 'stretch-limousine',
    category: 'Limousine',
    model: 'Lincoln Stretch / Chrysler 300 Stretch',
    tagline: 'Classic elegance and celebration luxury for weddings, galas, and special nights out.',
    image: '/images/Limousine-Service-e1763051925488.webp',
    passengerCapacity: 10,
    luggageCapacity: 2,
    rateHourly: 150,
    features: [
      '8–10 Passengers Max',
      'Bar & Mood Lighting',
      'Bluetooth Sound System',
      'Ideal for Events & Parties',
    ],
    description: 'Make a grand entry at weddings, anniversaries, prom nights, or concerts. Features J-seat lounge configuration, privacy divider, color-changing optic lights, and complimentary ice bar service.',
    amenities: ['Crystal Bar', 'Fiber Optic Ceiling', 'Privacy Divider', 'Subwoofer Sound System', 'Touchscreen Media Controls', 'Iced Beverage Bar'],
    ctaType: 'both',
  },
  {
    id: 'executive-sprinter-van',
    name: 'Executive Van',
    slug: 'executive-sprinter-van',
    category: 'Executive Van',
    model: 'Mercedes Sprinter / Ford Transit',
    tagline: 'First-class group mobility with stand-up headroom and custom leather captain chairs.',
    image: '/images/Event-Transportation-e1763052056749.webp',
    passengerCapacity: 14,
    luggageCapacity: 6,
    rateHourly: 175,
    features: [
      'Up to 14 Passengers',
      'Overhead Luggage Racks',
      'USB Ports at Every Seat',
      'Perfect for Group Shuttles',
    ],
    description: 'The gold standard for corporate group shuttles, golf trips, wedding guest transfers, and Boston to NYC long-distance road trips. Combines high-capacity seating with jet-class comfort.',
    amenities: ['Stand-Up Height', 'Individual Reclining Seats', 'HDMI TV Screens', 'HDMI / Apple TV Input', 'Deep Luggage Bay', 'Overhead Parcel Racks'],
    ctaType: 'both',
  },
];
