import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Users, Luggage, CheckCircle2, ArrowRight, Shield, Phone } from 'lucide-react';
import { FLEET_DATA } from '@/data/fleetData';

export async function generateStaticParams() {
  return FLEET_DATA.map((vehicle) => ({
    slug: vehicle.slug,
  }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const vehicle = FLEET_DATA.find((v) => v.slug === params.slug);
  if (!vehicle) return { title: 'Vehicle Not Found' };
  return {
    title: `${vehicle.name} | Executive Fleet Boston`,
    description: vehicle.tagline,
  };
}

export default function SingleFleetPage({ params }: { params: { slug: string } }) {
  const vehicle = FLEET_DATA.find((v) => v.slug === params.slug);

  if (!vehicle) {
    notFound();
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
          <span className="text-white font-medium">{vehicle.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Vehicle Image & Specs */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            <div className="relative h-80 sm:h-96 w-full rounded-2xl overflow-hidden border border-white/10 glass-card shadow-2xl">
              <Image
                src={vehicle.image}
                alt={vehicle.name}
                fill
                priority
                className="object-cover"
              />
              <div className="absolute top-4 left-4 bg-neutral-950/80 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-bold text-[#c5a059] border border-white/10">
                {vehicle.category}
              </div>
            </div>

            {/* Vehicle Overview */}
            <div className="glass-card rounded-2xl p-8 border border-white/10">
              <h3 className="font-serif text-2xl font-bold text-white mb-4">
                Vehicle Overview
              </h3>
              <p className="text-neutral-300 text-sm leading-relaxed mb-6">
                {vehicle.description}
              </p>

              <h4 className="font-serif text-lg font-bold text-white mb-3">
                Key Performance & Interior Features
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {vehicle.features.map((feat, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-xs text-neutral-300">
                    <CheckCircle2 className="w-4 h-4 text-[#c5a059] shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <h4 className="font-serif text-lg font-bold text-white mb-3">
                Included Amenities
              </h4>
              <div className="flex flex-wrap gap-2">
                {vehicle.amenities.map((amenity, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-white/10 text-xs text-[#c5a059] font-medium"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Pricing & Quick Booking Widget */}
          <div className="lg:col-span-5 flex flex-col gap-6 sticky top-28">
            <div className="glass-card rounded-2xl p-8 border border-white/10 shadow-2xl">
              <span className="text-[10px] uppercase tracking-widest font-extrabold text-[#c5a059] block mb-1">
                {vehicle.category} Specifications
              </span>
              <h1 className="font-serif text-3xl font-bold text-white mb-2">
                {vehicle.name}
              </h1>
              <p className="text-xs text-neutral-400 mb-6">{vehicle.model}</p>

              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-neutral-900 border border-white/5 mb-6 text-center">
                <div className="flex flex-col items-center gap-1">
                  <Users className="w-5 h-5 text-[#c5a059]" />
                  <span className="text-xs text-neutral-400">Capacity</span>
                  <span className="text-sm font-bold text-white">{vehicle.passengerCapacity} Passengers</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Luggage className="w-5 h-5 text-[#c5a059]" />
                  <span className="text-xs text-neutral-400">Luggage</span>
                  <span className="text-sm font-bold text-white">{vehicle.luggageCapacity} Suitcases</span>
                </div>
              </div>

              {vehicle.rateHourly && (
                <div className="mb-6 p-4 rounded-xl bg-neutral-900/60 border border-[#c5a059]/30 flex items-center justify-between">
                  <span className="text-xs text-neutral-400 font-medium">Starting Hourly Rate</span>
                  <span className="text-2xl font-serif font-bold text-[#c5a059]">
                    ${vehicle.rateHourly}<span className="text-xs text-neutral-400 font-normal">/hr</span>
                  </span>
                </div>
              )}

              <div className="flex flex-col gap-3">
                <Link
                  href={`/book?vehicle=${vehicle.slug}`}
                  className="gold-btn-gradient text-neutral-950 font-bold text-center py-4 rounded-xl uppercase tracking-wider text-xs shadow-xl flex items-center justify-center gap-2 hover:scale-[1.01] transition-transform"
                >
                  <span>Book {vehicle.name} Now</span>
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
