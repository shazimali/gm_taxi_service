import { NextResponse } from 'next/server';
import { vehicleRepository, corporateAccountRepository } from '@/lib/repositories';
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
  pickup?: string;
  dropoff?: string;
  estimatedMiles?: number;
  estimatedMinutes?: number;
  hourlyCount?: number;
  corporateAccountCode?: string;
}) {
  const {
    vehicleSlug = 'executive-sedan',
    serviceType,
    pickup = '',
    dropoff = '',
    estimatedMiles = 0,
    estimatedMinutes = 0,
    hourlyCount = 2,
    corporateAccountCode,
  } = params;

  // 1. Fetch vehicle pricing config (including active zone routes)
  const vehicle = await vehicleRepository.findBySlug(vehicleSlug);

  const vehicleConfig = toVehiclePricingConfig(vehicle);

  // 2. Lookup corporate account discount if code provided
  let corporateDiscountPct = 0;
  let corporateAccountInfo: {
    id: string;
    name: string;
    accountCode: string;
    discountPct: number;
  } | null = null;

  if (corporateAccountCode?.trim()) {
    const account = await corporateAccountRepository.findByCode(corporateAccountCode);
    if (account && account.isActive) {
      corporateDiscountPct = account.discountPct;
      corporateAccountInfo = {
        id: account.id,
        name: account.name,
        accountCode: account.accountCode,
        discountPct: account.discountPct,
      };
    }
  }

  // 3. Calculate fare using pricing engine
  const calculation = pricingService.calculate({
    serviceType: normalizeServiceType(serviceType),
    vehicleConfig,
    hourlyCount: Number(hourlyCount) || 2,
    pickup,
    dropoff,
    estimatedMiles: Number(estimatedMiles) || 0,
    estimatedMinutes: Number(estimatedMinutes) || 0,
    corporateDiscountPct,
  });

  return {
    ...calculation,
    corporateAccount: corporateAccountInfo,
    corporateCodeValid: !!corporateAccountInfo,
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
      pickup: searchParams.get('pickup') || undefined,
      dropoff: searchParams.get('dropoff') || undefined,
      estimatedMiles: Number(searchParams.get('estimatedMiles')) || undefined,
      estimatedMinutes: Number(searchParams.get('estimatedMinutes')) || undefined,
      hourlyCount: Number(searchParams.get('hourlyCount')) || undefined,
      corporateAccountCode: searchParams.get('corporateAccountCode') || undefined,
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
