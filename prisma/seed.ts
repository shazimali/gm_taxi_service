import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding local MySQL database...');

  // 1. Create Default Admin User
  const passwordHash = await bcrypt.hash('AdminPass123!', 10);
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@gmlimoservices.com' },
    update: { password: passwordHash },
    create: {
      email: 'admin@gmlimoservices.com',
      name: 'System Admin',
      password: passwordHash,
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
      image: '/images/Businessedited-1024x526-1-e1751891182287.webp',
      passengerCapacity: 3,
      luggageCapacity: 2,
      rateHourly: 85,
      features: ['Leather Interior & Wi-Fi', '3 Passengers', '2 Large Suitcases', '2 Carry-on Bags'],
      description: 'Our Executive Sedan is the gold standard for discreet, punctual corporate travel and solo or couple airport transfers.',
      displayOrder: 1,
    },
    {
      name: 'Executive SUV',
      slug: 'executive-suv',
      category: 'Executive SUV',
      model: 'Chevy Suburban / GMC Yukon XL',
      image: '/images/suburbanedited-1024x557-1-e1751891129532.webp',
      passengerCapacity: 6,
      luggageCapacity: 5,
      rateHourly: 110,
      features: ['Extra Legroom & Cargo Space', 'Up to 6 Passengers', '5 Large Suitcases', 'All-Wheel Drive Performance'],
      description: 'Spacious, high-body luxury SUV crafted for family trips, small executive teams, and airport drop-offs.',
      displayOrder: 2,
    },
    {
      name: 'Premium Escalade ESV',
      slug: 'premium-escalade-esv',
      category: 'Premium SUV',
      model: 'Cadillac Escalade ESV (Newest Model)',
      image: '/images/Cadillacedited-1024x556-1-e1751891079361.webp',
      passengerCapacity: 6,
      luggageCapacity: 6,
      rateHourly: 135,
      features: ['AKG Studio Audio', 'Rear Entertainment Screens', 'Panoramaroof & Heated Seats', 'VIP Executive Privacy Tint'],
      description: 'The pinnacle of American luxury SUV travel—perfect for high-profile clients and red-carpet arrivals.',
      displayOrder: 3,
    },
    {
      name: 'Stretch Limousine',
      slug: 'stretch-limousine',
      category: 'Ultra Luxury Limo',
      model: 'Lincoln MKT Stretch Limo',
      image: '/images/Stretch-Limousine-e1763052103444.webp',
      passengerCapacity: 8,
      luggageCapacity: 4,
      rateHourly: 150,
      features: ['Custom LED Mood Lighting', 'Built-in Ice Bar', 'Privacy Partition', 'Bluetooth Sound System'],
      description: 'Make a grand entry at weddings, anniversaries, prom nights, or concerts.',
      displayOrder: 4,
    },
    {
      name: 'Executive Van',
      slug: 'executive-sprinter-van',
      category: 'Executive Van',
      model: 'Mercedes Sprinter / Ford Transit',
      image: '/images/Event-Transportation-e1763052056749.webp',
      passengerCapacity: 14,
      luggageCapacity: 6,
      rateHourly: 175,
      features: ['Up to 14 Passengers', 'Overhead Luggage Racks', 'USB Ports at Every Seat', 'Perfect for Group Shuttles'],
      description: 'The gold standard for corporate group shuttles, golf trips, and wedding guest transfers.',
      displayOrder: 5,
    },
  ];

  for (const v of vehicles) {
    const data = {
      name: v.name,
      slug: v.slug,
      category: v.category,
      model: v.model,
      passengerCapacity: v.passengerCapacity,
      luggageCapacity: v.luggageCapacity,
      rateHourly: v.rateHourly,
      description: v.description,
      image: v.image,
      features: JSON.stringify(v.features),
      displayOrder: v.displayOrder,
    };
    await prisma.vehicle.upsert({
      where: { slug: v.slug },
      update: data,
      create: data,
    });
  }
  console.log('Vehicles seeded into MySQL.');

  // 4. Services Seed
  const services = [
    {
      name: 'Airport Transportation',
      slug: 'airport-transfers',
      tagline: 'Stress-free, 24/7 transfers for Logan (BOS), TF Green (PVD), Hanscom (BED) & Regional Airports.',
      image: '/images/Boston-Luxury-Chauffeur.webp',
      description: 'Flight tracking, luggage assistance, and curbside meet & greet.',
      fullDetails: 'Experience seamless airport travel with GM Limo Services. We track your flight in real-time to adjust for early arrivals or delays.',
      features: ['Real-time Flight Tracking', 'Complimentary Wait Time', 'Professional Uniformed Chauffeur', 'Luggage Handling Assistance'],
      benefits: ['Guaranteed On-Time Pickup', 'Flight Monitoring Included', 'Curbside or Gate Meet & Greet', '24/7 Dispatch Support'],
      displayOrder: 1,
    },
    {
      name: 'Hourly Private Chauffeur',
      slug: 'hourly-chauffeur',
      tagline: 'Dedicated vehicle and driver on-demand for executive meetings, shopping, and events.',
      image: '/images/Event-Transportation-e1763052056749.webp',
      description: 'Maximum flexibility for your schedule. Change destinations on the fly.',
      fullDetails: 'Our Hourly Chauffeur Service gives you ultimate convenience. Your private driver stays with you between stops.',
      features: ['Unlimited Stops & Schedule Flexibility', 'Dedicated Chauffeur on Standby', 'Executive Amenities Included'],
      benefits: ['No Re-booking Required Between Stops', 'Chauffeur Waits Onsite', 'Ideal for Multi-stop Itineraries'],
      displayOrder: 2,
    },
    {
      name: 'Long Distance City-to-City Transfer',
      slug: 'point-to-point',
      tagline: 'Direct, door-to-door luxury travel between Boston, NYC, Cape Cod & Providence.',
      image: '/images/Stretch-Limousine-e1763052103444.webp',
      description: 'Avoid crowded train stations and flight layovers with direct private transport.',
      fullDetails: 'Travel between major cities in peace and luxury. Relax or work with onboard Wi-Fi while our experienced chauffeurs handle highway driving.',
      features: ['Direct Non-Stop Service', 'Workplace Wi-Fi & Charging', 'Comfortable Long-Distance Seating'],
      benefits: ['Door-to-Door Convenience', 'Privacy for Business Calls', 'No TSA Airport Lines'],
      displayOrder: 3,
    },
  ];

  for (const s of services) {
    const data = {
      name: s.name,
      slug: s.slug,
      tagline: s.tagline,
      description: s.description,
      fullDetails: s.fullDetails,
      image: s.image,
      features: JSON.stringify(s.features),
      benefits: JSON.stringify(s.benefits),
      iconName: 'Car',
      displayOrder: s.displayOrder,
    };
    await prisma.service.upsert({
      where: { slug: s.slug },
      update: data,
      create: data,
    });
  }
  console.log('Services seeded into MySQL.');

  // 5. Travel Times & Distances Seed
  const travelRates = [
    { location: 'Arlington, MA', distance: '11 miles', time: '25 – 40m', price: '$75', pickupZone: 'Meeting Point', displayOrder: 1 },
    { location: 'Newton, MA', distance: '14 miles', time: '30 – 45m', price: '$85', pickupZone: 'Terminal C/E', displayOrder: 2 },
    { location: 'Cambridge, MA', distance: '6 miles', time: '20 – 30m', price: '$65', pickupZone: 'Limo Stand', displayOrder: 3 },
    { location: 'Lexington, MA', distance: '17 miles', time: '35 – 50m', price: '$95', pickupZone: 'Terminal B', displayOrder: 4 },
    { location: 'Wellesley, MA', distance: '18 miles', time: '35 – 50m', price: '$105', pickupZone: 'Meeting Point', displayOrder: 5 },
    { location: 'Westwood, MA', distance: '22 miles', time: '40 – 55m', price: '$115', pickupZone: 'Terminal B/C', displayOrder: 6 },
  ];

  const existingRatesCount = await prisma.airportTravelRate.count();
  if (existingRatesCount === 0) {
    for (const rate of travelRates) {
      await prisma.airportTravelRate.create({
        data: {
          location: rate.location,
          distance: rate.distance,
          time: rate.time,
          price: rate.price,
          pickupZone: rate.pickupZone,
          displayOrder: rate.displayOrder,
          isActive: true,
        },
      });
    }
    console.log('Airport travel rates seeded into MySQL.');
  }
}


main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
