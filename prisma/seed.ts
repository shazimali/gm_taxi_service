import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';


async function main() {
  console.log('Seeding local MySQL database...');

  // 1. Create Default Admin User
  const passwordHash = await bcrypt.hash('AdminPass123!', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@gmlimoservices.com' },
    update: { passwordHash },
    create: {
      email: 'admin@gmlimoservices.com',
      name: 'System Admin',
      passwordHash,
      role: 'ADMIN',
    },
  });
  console.log('Admin user created:', admin.email);

  // 2. Create Site Settings
  await prisma.siteSetting.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      phoneDisplay: '(617) 784-0264',
      phoneTel: '16177840264',
      dispatchEmail: 'info@bostonluxurychauffeur.com',
      serviceAddress: 'Boston, Massachusetts, USA',
      heroTitleGold: 'Boston Luxury Chauffeur',
      heroTitleMain: '— Logan Airport Car Service',
      heroSubtitle: 'Elite Corporate Travel, Private Event Transportation & Logan Airport Transfers',
    },
  });

  // 3. Vehicles Seed
  const vehicles = [
    {
      name: 'Business Class Sedan',
      slug: 'executive-sedan',
      category: 'Sedan',
      model: 'Lincoln Continental / Cadillac CT6',
      tagline: 'Refined luxury for corporate travelers and private airport transfers.',
      image: '/images/Businessedited-1024x526-1-e1751891182287.webp',
      passengerCapacity: 3,
      luggageCapacity: 2,
      rateHourly: 85,
      features: ['Leather Interior & Wi-Fi', '3 Passengers', '2 Large Suitcases', '2 Carry-on Bags'],
      amenities: ['Leather Interior', 'Wi-Fi Access', 'Device Charging', 'Bottled Water', 'Climate Control', 'Flight Tracking'],
      description: 'Our Executive Sedan is the gold standard for discreet, punctual corporate travel and solo or couple airport transfers.',
      ctaType: 'both',
      displayOrder: 1,
    },
    {
      name: 'Executive SUV',
      slug: 'executive-suv',
      category: 'SUV',
      model: 'Cadillac Escalade / Chevy Suburban',
      tagline: 'Spacious all-weather luxury for executive groups, families, and roadshows.',
      image: '/images/suv.webp',
      passengerCapacity: 6,
      luggageCapacity: 5,
      rateHourly: 110,
      features: ['All-Wheel Drive Comfort', '6 Passengers', '5 Large Suitcases', '2 Carry-on Bags'],
      amenities: ['Captain Chairs', 'AWD All-Weather', 'Extended Trunk Space', 'Privacy Glass', 'USB-C Ports', 'Premium Bose Audio'],
      description: 'Designed for executive travel, family vacations, or winter weather resilience in New England.',
      ctaType: 'both',
      displayOrder: 2,
    },
    {
      name: 'Premium Luxury SUV',
      slug: 'premium-escalade-esv',
      category: 'Flagship SUV',
      model: 'Cadillac Escalade ESV',
      tagline: 'The ultimate flagship SUV for VIP clientele, celebrities, and executive roadshows.',
      image: '/images/blc89.webp',
      passengerCapacity: 6,
      luggageCapacity: 5,
      rateHourly: 135,
      features: ['Cadillac Escalade ESV', '6 Passengers', '5 Large Suitcases + Extra Cargo', 'VIP Entertainment System'],
      amenities: ['AKG Audio System', 'Dual OLED Screens', 'Panoramic Sunroof', 'Air Ride Suspension', 'Refrigerated Console'],
      description: 'The pinnacle of American luxury mobility. Featuring custom leather upholstery and air ride suspension.',
      ctaType: 'both',
      displayOrder: 3,
    },
    {
      name: 'Stretch Limousine',
      slug: 'stretch-limousine',
      category: 'Limousine',
      model: 'Lincoln Stretch / Chrysler 300 Stretch',
      tagline: 'Classic elegance and celebration luxury for weddings, galas, and special nights out.',
      image: '/images/Limousine-Service-e1763051925488.webp',
      passengerCapacity: 10,
      luggageCapacity: 2,
      rateHourly: 150,
      features: ['8–10 Passengers Max', 'Bar & Mood Lighting', 'Bluetooth Sound System', 'Ideal for Events & Parties'],
      amenities: ['Crystal Bar', 'Fiber Optic Ceiling', 'Privacy Divider', 'Subwoofer Sound System', 'Touchscreen Media Controls'],
      description: 'Make a grand entry at weddings, anniversaries, prom nights, or concerts.',
      ctaType: 'both',
      displayOrder: 4,
    },
    {
      name: 'Executive Van',
      slug: 'executive-sprinter-van',
      category: 'Executive Van',
      model: 'Mercedes Sprinter / Ford Transit',
      tagline: 'First-class group mobility with stand-up headroom and custom leather captain chairs.',
      image: '/images/Event-Transportation-e1763052056749.webp',
      passengerCapacity: 14,
      luggageCapacity: 6,
      rateHourly: 175,
      features: ['Up to 14 Passengers', 'Overhead Luggage Racks', 'USB Ports at Every Seat', 'Perfect for Group Shuttles'],
      amenities: ['Stand-Up Height', 'Individual Reclining Seats', 'HDMI TV Screens', 'HDMI / Apple TV Input', 'Deep Luggage Bay'],
      description: 'The gold standard for corporate group shuttles, golf trips, and wedding guest transfers.',
      ctaType: 'both',
      displayOrder: 5,
    },
  ];

  for (const v of vehicles) {
    await prisma.vehicle.upsert({
      where: { slug: v.slug },
      update: v,
      create: v,
    });
  }
  console.log('Vehicles seeded into MySQL.');

  // 4. Services Seed
  const services = [
    {
      name: 'Airport Transportation',
      slug: 'airport-transfers',
      tagline: 'Stress-free, 24/7 transfers for Logan (BOS), TF Green (PVD), Hanscom (BED) & Regional Airports.',
      badge: 'Airport Chauffeur',
      icon: '✈️',
      image: '/images/Boston-Luxury-Chauffeur.webp',
      shortDesc: 'Seamless Logan, TF Green, Manchester & Providence airport transfers with real-time flight monitoring.',
      fullDesc: 'Navigating airport traffic, parking, and terminal delays can disrupt your schedule. GM Limo Services provides precision airport chauffeur service.',
      benefits: ['60 Minutes Complimentary Wait Time', 'Live Flight Status Tracking', 'Meet & Greet Service', 'Fixed All-Inclusive Pricing'],
      keyFeatures: ['24/7 Dispatch Monitoring', 'Flight Tail Number Tracking', 'Luxury Fleet'],
      displayOrder: 1,
    },
    {
      name: 'Hourly Private Chauffeur',
      slug: 'hourly-chauffeur',
      tagline: 'Dedicated vehicle and chauffeur at your service for complete schedule flexibility.',
      badge: 'By The Hour',
      icon: '🕐',
      image: '/images/Hourly-Chayffeur-Service-e1763051109937.jpe',
      shortDesc: 'Book a dedicated chauffeur by the hour — ideal for roadshows, multi-stop corporate errands, and city-wide VIP escort.',
      fullDesc: 'When your day demands multiple stops or unpredictable meeting durations, our By-The-Hour service offers ultimate flexibility.',
      benefits: ['Flexible Multi-Stop Itineraries', 'Chauffeur Standby', 'Zero Surge Multipliers'],
      keyFeatures: ['Minimum 2 to 3 Hour Blocks', 'Direct Chauffeur Contact'],
      displayOrder: 2,
    },
    {
      name: 'Long Distance City-to-City Transfer',
      slug: 'point-to-point',
      tagline: 'Comfortable, private non-stop travel between Boston, NYC, Providence, and across New England.',
      badge: 'Long Distance',
      icon: '🗺️',
      image: '/images/City-to-City-Transfer-e1763051857279.webp',
      shortDesc: 'Flat-rate city-to-city rides between Boston, New York, Providence, Hartford & beyond.',
      fullDesc: 'Skip crowded regional flights and train delays. Our City-to-City service transforms travel time into productive or relaxing hours.',
      benefits: ['Door-to-Door Express Travel', 'Zero TSA Queue', 'Mobile Office Environment'],
      keyFeatures: ['Boston ↔ Manhattan Express', 'Boston ↔ Cape Cod Shuttles'],
      displayOrder: 3,
    },
    {
      name: 'Luxury Chauffeur & Limousine',
      slug: 'corporate-accounts',
      tagline: 'Bespoke corporate mobility solutions with consolidated billing and priority dispatch.',
      badge: 'VIP Service',
      icon: '🚘',
      image: '/images/Limousine-Service-e1763051925488.webp',
      shortDesc: 'White-glove chauffeur service in late-model Lincoln Continentals, Cadillac CT6s, and Escalade ESVs.',
      fullDesc: 'GM Limo Services partners with leading corporations, venture capital firms, law firms, and biotech leaders.',
      benefits: ['Centralized Monthly Billing', 'Priority Dispatch', 'NDAs & Confidentiality'],
      keyFeatures: ['Duty of Care Compliance', 'Roadshow Logistics Supervision'],
      displayOrder: 4,
    },
    {
      name: 'Event Limo Service',
      slug: 'event-limo',
      tagline: 'Galas, concerts, sporting events, and corporate dinners.',
      badge: 'Special Event',
      icon: '🎭',
      image: '/images/Event-Transportation-e1763052056749.webp',
      shortDesc: 'Galas, concerts, sporting events, and corporate dinners — arrive on time, in style, without the parking hassle.',
      fullDesc: 'Make a grand entrance at your next concert, gala, championship game, or night on the town.',
      benefits: ['Door-to-Door Venue Drop-Off', 'Chauffeur Standby', 'Ice Bucket Refreshments'],
      keyFeatures: ['Fenway & TD Garden Shuttles', 'Gala Transportation'],
      displayOrder: 5,
    },
    {
      name: 'Private Wedding Limo',
      slug: 'weddings-special-events',
      tagline: 'Flawless wedding party transportation, luxury stretch limos, and guest group shuttles.',
      badge: 'Weddings',
      icon: '💍',
      image: '/images/Wedding-Limo-Service-e1763052179994.webp',
      shortDesc: 'Bespoke bridal transportation packages — rehearsal dinner through send-off, coordinated to the minute.',
      fullDesc: 'Your wedding day or milestone gala deserves perfection down to every detail.',
      benefits: ['Red Carpet Service', 'Chilled Champagne Bar', 'Multi-Vehicle Fleet Logistics'],
      keyFeatures: ['Bridal Party Packages', 'Guest Shuttle Sprinter Vans'],
      displayOrder: 6,
    },
  ];

  for (const s of services) {
    await prisma.service.upsert({
      where: { slug: s.slug },
      update: s,
      create: s,
    });
  }
  console.log('Services seeded into MySQL.');

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
