import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Users, Luggage, CheckCircle2, ArrowRight, Phone } from 'lucide-react';
import { FLEET_DATA } from '@/data/fleetData';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  return FLEET_DATA.map((vehicle) => ({
    slug: vehicle.slug,
  }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  try {
    const dbVehicle = await prisma.vehicle.findUnique({
      where: { slug: params.slug },
    });
    if (dbVehicle) {
      return {
        title: `${dbVehicle.name} | Executive Fleet Boston`,
        description: dbVehicle.description,
      };
    }
  } catch {}

  const vehicle = FLEET_DATA.find((v) => v.slug === params.slug);
  if (!vehicle) return { title: 'Vehicle Not Found' };
  return {
    title: `${vehicle.name} | Executive Fleet Boston`,
    description: vehicle.tagline,
  };
}

export default async function SingleFleetPage({ params }: { params: { slug: string } }) {
  let name = '';
  let category = 'Executive';
  let model = '';
  let image = '';
  let description = '';
  let passengerCapacity = 4;
  let luggageCapacity = 3;
  let rateHourly: number | null = null;
  let features: string[] = [];

  // 1. Try fetching from live MySQL database
  try {
    const dbVehicle = await prisma.vehicle.findUnique({
      where: { slug: params.slug },
    });

    if (dbVehicle) {
      name = dbVehicle.name;
      category = dbVehicle.category || 'Executive';
      model = dbVehicle.model || dbVehicle.name;
      image = dbVehicle.image || '/images/Businessedited-1024x526-1-e1751891182287.webp';
      description = dbVehicle.description || '';
      passengerCapacity = dbVehicle.passengerCapacity;
      luggageCapacity = dbVehicle.luggageCapacity;
      rateHourly = dbVehicle.rateHourly;

      if (typeof dbVehicle.features === 'string' && dbVehicle.features) {
        try { features = JSON.parse(dbVehicle.features); } catch { features = [dbVehicle.features]; }
      }
    }
  } catch (err) {
    console.error('Error loading vehicle from DB:', err);
  }

  // 2. Fallback to static data if database record not found
  if (!name) {
    const staticVehicle = FLEET_DATA.find((v) => v.slug === params.slug);
    if (!staticVehicle) {
      notFound();
    }
    name = staticVehicle.name;
    category = staticVehicle.category;
    model = staticVehicle.model;
    image = staticVehicle.image;
    description = staticVehicle.description;
    passengerCapacity = staticVehicle.passengerCapacity;
    luggageCapacity = staticVehicle.luggageCapacity;
    rateHourly = staticVehicle.rateHourly || null;
    features = staticVehicle.features;
  }

  return (
    <div className="pt-28 pb-20 bg-neutral-950 text-neutral-100">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-neutral-400 mb-8">
          <Link href="/" className="hover:text-[#c5a059]">Home</Link>
          <span>/</span>
          <Link href="/fleet" className="hover:text-[#c5a059]">Fleet</Link>
          <span>/</span>
          <span className="text-white font-medium">{name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Vehicle Image & Specs */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            <div className="relative h-80 sm:h-96 w-full rounded-2xl overflow-hidden border border-white/10 glass-card shadow-2xl">
              <img
                src={image}
                alt={name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 bg-neutral-950/80 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-bold text-[#c5a059] border border-white/10">
                {category}
              </div>
            </div>

            {/* Vehicle Overview */}
            <div className="glass-card rounded-2xl p-8 border border-white/10">
              <h3 className="font-serif text-2xl font-bold text-white mb-4">
                Vehicle Overview
              </h3>
              <p className="text-neutral-300 text-sm leading-relaxed mb-6">
                {description}
              </p>

              {features.length > 0 && (
                <>
                  <h4 className="font-serif text-lg font-bold text-white mb-3">
                    Key Performance &amp; Interior Features
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                    {features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-xs text-neutral-300">
                        <CheckCircle2 className="w-4 h-4 text-[#c5a059] shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>

          {/* Right Column: Pricing & Quick Booking Widget */}
          <div className="lg:col-span-5 flex flex-col gap-6 sticky top-28">
            <div className="glass-card rounded-2xl p-8 border border-white/10 shadow-2xl">
              <span className="text-[10px] uppercase tracking-widest font-extrabold text-[#c5a059] block mb-1">
                {category} Specifications
              </span>
              <h1 className="font-serif text-3xl font-bold text-white mb-2">
                {name}
              </h1>
              <p className="text-xs text-neutral-400 mb-6">{model}</p>

              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-neutral-900 border border-white/5 mb-6 text-center">
                <div className="flex flex-col items-center gap-1">
                  <Users className="w-5 h-5 text-[#c5a059]" />
                  <span className="text-xs text-neutral-400">Capacity</span>
                  <span className="text-sm font-bold text-white">{passengerCapacity} Passengers</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Luggage className="w-5 h-5 text-[#c5a059]" />
                  <span className="text-xs text-neutral-400">Luggage</span>
                  <span className="text-sm font-bold text-white">{luggageCapacity} Suitcases</span>
                </div>
              </div>

              {rateHourly && (
                <div className="mb-6 p-4 rounded-xl bg-neutral-900/60 border border-[#c5a059]/30 flex items-center justify-between">
                  <span className="text-xs text-neutral-400 font-medium">Starting Hourly Rate</span>
                  <span className="text-2xl font-serif font-bold text-[#c5a059]">
                    ${rateHourly}<span className="text-xs text-neutral-400 font-normal">/hr</span>
                  </span>
                </div>
              )}

              <div className="flex flex-col gap-3">
                <Link
                  href={`/book?vehicle=${params.slug}`}
                  className="gold-btn-gradient text-neutral-950 font-bold text-center py-4 rounded-xl uppercase tracking-wider text-xs shadow-xl flex items-center justify-center gap-2 hover:scale-[1.01] transition-transform"
                >
                  <span>Book {name} Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href="tel:16177840264"
                  className="py-3.5 rounded-xl border border-white/20 hover:border-[#c5a059] text-white font-bold text-xs text-center flex items-center justify-center gap-2 transition-colors"
                >
                  <Phone className="w-4 h-4 text-[#c5a059]" />
                  <span>Call (617) 784-0264 for Quote</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
