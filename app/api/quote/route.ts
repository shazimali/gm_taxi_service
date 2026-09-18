import { NextResponse } from 'next/server';
import { vehicleRepository } from '@/lib/repositories';
import { pricingService } from '@/lib/services/PricingService';
import { toVehiclePricingConfig } from '@/lib/repositories/vehiclePricingConfigMapper';

export const dynamic = 'force-dynamic';

function normalizeServiceType(st?: string): 'hourly' | 'point-to-point' {
  if (!st) return 'point-to-point';
  const lower = st.toLowerCase();
  if (lower.includes('hour')) return 'hourly';
  return 'point-to-point';
}

async function handleQuote(params: {
  vehicleSlug?: string;
  serviceType?: string;
  estimatedMiles?: number;
  estimatedMinutes?: number;
  hourlyCount?: number;
}) {
  const {
    vehicleSlug = 'executive-sedan',
    serviceType,
    estimatedMiles = 0,
    estimatedMinutes = 0,
    hourlyCount = 2,
  } = params;

  const vehicle = await vehicleRepository.findBySlug(vehicleSlug);
  const vehicleConfig = toVehiclePricingConfig(vehicle);

  const calculation = pricingService.calculate({
    serviceType: normalizeServiceType(serviceType),
    vehicleConfig,
    hourlyCount: Number(hourlyCount) || 2,
    estimatedMiles: Number(estimatedMiles) || 0,
    estimatedMinutes: Number(estimatedMinutes) || 0,
  });

  return {
    ...calculation,
    vehicle: vehicle
      ? {
          id: vehicle.id,
          name: vehicle.name,
          slug: vehicle.slug,
        }
      : null,
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await handleQuote(body);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Quote Calculation Error (POST):', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to calculate quote.' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const result = await handleQuote({
      vehicleSlug: searchParams.get('vehicleSlug') || undefined,
      serviceType: searchParams.get('serviceType') || undefined,
      estimatedMiles: Number(searchParams.get('estimatedMiles')) || undefined,
      estimatedMinutes: Number(searchParams.get('estimatedMinutes')) || undefined,
      hourlyCount: Number(searchParams.get('hourlyCount')) || undefined,
    });
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Quote Calculation Error (GET):', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to calculate quote.' },
      { status: 500 }
    );
  }
}
