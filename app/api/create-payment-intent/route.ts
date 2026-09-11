import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getCurrentPassenger } from '@/lib/auth';
import { vehicleRepository, corporateAccountRepository } from '@/lib/repositories';
import { pricingService } from '@/lib/services/PricingService';
import type { VehiclePricingConfig } from '@/lib/services/interfaces/IPricingService';

export const dynamic = 'force-dynamic';

// ── Server-side price bounds ──────────────────────────────────────────────────
const MIN_AMOUNT_USD = 5;      // $5.00 minimum trip price
const MAX_AMOUNT_USD = 10_000; // $10,000 maximum trip price

function normalizeServiceType(st?: string): 'hourly' | 'point-to-point' {
  if (!st) return 'point-to-point';
  const lower = st.toLowerCase();
  if (lower.includes('hour')) return 'hourly';
  return 'point-to-point';
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      vehicleSlug,
      serviceType = 'Airport Transportation',
      estimatedMinutes,
      estimatedMiles,
      hourlyCount,
      pickupLocation,
      dropoffLocation,
      paymentMethodId,
      corporateAccountCode,
    } = body;

    // ── Require authentication ────────────────────────────────────────────
    const passenger = await getCurrentPassenger();
    if (!passenger) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    // ── 🔒 Security: Compute price strictly server-side from vehicle rates & duration ──
    // Never trust an 'amount' passed by the client!
    const targetSlug = vehicleSlug || 'executive-sedan';
    const vehicle = await vehicleRepository.findBySlug(targetSlug);

    const vehicleConfig: VehiclePricingConfig = {
      rateHourly: vehicle?.rateHourly ?? 85,
      minHours: vehicle?.minHours ?? 2,
      ratePerMile: vehicle?.ratePerMile ?? 3.5,
      ratePerMinute: vehicle?.ratePerMinute ?? 0.65,
      baseFee: vehicle?.baseFee ?? 15,
      minimumTripFee: vehicle?.minimumTripFee ?? 65,
      zoneRoutes: (vehicle?.zoneRoutes || []).map((zr) => ({
        id: zr.id,
        name: zr.name,
        pickupKeywords: zr.pickupKeywords
          .split(',')
          .map((k: string) => k.trim().toLowerCase())
          .filter(Boolean),
        dropoffKeywords: zr.dropoffKeywords
          .split(',')
          .map((k: string) => k.trim().toLowerCase())
          .filter(Boolean),
        flatRate: zr.flatRate,
      })),
    };

    let corporateDiscountPct = 0;
    let corporateAccountId: string | null = null;
    if (corporateAccountCode?.trim()) {
      const account = await corporateAccountRepository.findByCode(corporateAccountCode);
      if (account && account.isActive) {
        corporateDiscountPct = account.discountPct;
        corporateAccountId = account.id;
      }
    }

    const parsedMinutes = Number(estimatedMinutes);
    const parsedMiles = Number(estimatedMiles);
    const parsedHours = Number(hourlyCount);

    const priceCalc = pricingService.calculate({
      serviceType: normalizeServiceType(serviceType),
      vehicleConfig,
      pickup: pickupLocation || '',
      dropoff: dropoffLocation || '',
      estimatedMinutes: !isNaN(parsedMinutes) && parsedMinutes > 0 ? parsedMinutes : 0,
      estimatedMiles: !isNaN(parsedMiles) && parsedMiles > 0 ? parsedMiles : 0,
      hourlyCount: !isNaN(parsedHours) && parsedHours > 0 ? parsedHours : 2,
      corporateDiscountPct,
    });

    // Stripe hold covers the fare after discount (tip is customer selected at checkout)
    const holdAmount = priceCalc.fareAfterDiscount;

    if (holdAmount < MIN_AMOUNT_USD || holdAmount > MAX_AMOUNT_USD) {
      return NextResponse.json(
        { error: `Calculated fare ($${holdAmount}) is outside allowed limits.` },
        { status: 400 }
      );
    }

    const amountInCents = Math.round(holdAmount * 100);

    const paymentIntentOptions: any = {
      amount: amountInCents,
      currency: 'usd',
      capture_method: 'manual', // 🔒 Hold funds until destination reached!
      payment_method_types: ['card'],
      metadata: {
        vehicleSlug: targetSlug,
        calculatedPrice: priceCalc.totalPrice,
        fareMode: priceCalc.fareMode,
        baseFare: priceCalc.baseFare.toString(),
        discountAmount: priceCalc.discountAmount.toString(),
        corporateAccountId: corporateAccountId || '',
        pickupLocation: pickupLocation || '',
        dropoffLocation: dropoffLocation || '',
        passengerId: passenger.id,
        passengerEmail: passenger.email,
      },
    };

    if (passenger?.stripeCustomerId) {
      paymentIntentOptions.customer = passenger.stripeCustomerId;
    }

    if (paymentMethodId && passenger?.stripeCustomerId) {
      paymentIntentOptions.payment_method = paymentMethodId;
      paymentIntentOptions.confirm = true;
      paymentIntentOptions.off_session = true;
    }

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentOptions);

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status,
      calculatedPrice: priceCalc.totalPrice,
    });
  } catch (error: any) {
    console.error('PaymentIntent Creation Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create payment hold authorization.' },
      { status: 500 }
    );
  }
}

