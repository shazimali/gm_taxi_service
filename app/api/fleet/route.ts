import { NextResponse } from 'next/server';
import { vehicleRepository } from '@/lib/repositories';
import { FLEET_DATA, type Vehicle } from '@/data/fleetData';

export const dynamic = 'force-dynamic';

// Public fleet listing (booking form, vehicle selection step).
// Falls back to the static FLEET_DATA if the database has no vehicles yet.
export async function GET() {
  try {
    const dbVehicles = await vehicleRepository.findAll();

    if (dbVehicles.length > 0) {
      const fleet: Vehicle[] = dbVehicles.map((v) => ({
        id: v.id,
        name: v.name,
        slug: v.slug,
        category: v.category,
        model: v.model,
        tagline: v.tagline || v.description || '',
        image: v.image || '/images/Businessedited-1024x526-1-e1751891182287.webp',
        passengerCapacity: v.passengerCapacity,
        luggageCapacity: v.luggageCapacity,
        rateHourly: v.rateHourly ?? undefined,
        features: v.features ? JSON.parse(v.features) : [],
        description: v.description || '',
        amenities: v.amenities ? JSON.parse(v.amenities) : [],
        ctaType: (v.ctaType as 'book' | 'quote' | 'both') || 'both',
      }));

      return NextResponse.json({ fleet });
    }
  } catch (error) {
    console.error('Error fetching fleet for booking form:', error);
  }

  return NextResponse.json({ fleet: FLEET_DATA });
}
