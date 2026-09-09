import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getCurrentPassenger } from '@/lib/auth';
import { vehicleRepository } from '@/lib/repositories';
import { pricingService } from '@/lib/services/PricingService';

export const dynamic = 'force-dynamic';

// ── Server-side price bounds ──────────────────────────────────────────────────
const MIN_AMOUNT_USD = 5;      // $5.00 minimum trip price
const MAX_AMOUNT_USD = 10_000; // $10,000 maximum trip price

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      vehicleSlug,
      serviceType = 'Airport Transportation',
      estimatedMinutes,
      hourlyCount,
      pickupLocation,
      dropoffLocation,
      paymentMethodId,
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
    const rateHourly = vehicle?.rateHourly || 85;

    const parsedMinutes = Number(estimatedMinutes);
    const parsedHours = Number(hourlyCount);

    const priceCalc = pricingService.calculate({
      serviceType: String(serviceType),
      rateHourly,
      estimatedMinutes: !isNaN(parsedMinutes) && parsedMinutes > 0 ? parsedMinutes : 30,
      hourlyCount: !isNaN(parsedHours) && parsedHours > 0 ? parsedHours : 2,
    });

    const calculatedTotal = priceCalc.numericTotal;

    if (calculatedTotal < MIN_AMOUNT_USD || calculatedTotal > MAX_AMOUNT_USD) {
      return NextResponse.json(
        { error: `Calculated fare ($${calculatedTotal}) is outside allowed limits.` },
        { status: 400 }
      );
    }

    const amountInCents = Math.round(calculatedTotal * 100);

    const paymentIntentOptions: any = {
      amount: amountInCents,
      currency: 'usd',
      capture_method: 'manual', // 🔒 Hold funds until destination reached!
      payment_method_types: ['card'],
      metadata: {
        vehicleSlug: targetSlug,
        calculatedPrice: priceCalc.totalPrice,
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

