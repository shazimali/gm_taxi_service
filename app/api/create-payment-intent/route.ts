import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getCurrentPassenger } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// ── Server-side price bounds ──────────────────────────────────────────────────
const MIN_AMOUNT_USD = 5;      // $5.00 minimum trip price
const MAX_AMOUNT_USD = 10_000; // $10,000 maximum trip price

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, vehicleSlug, pickupLocation, dropoffLocation, paymentMethodId } = body;

    // ── Require authentication ────────────────────────────────────────────
    const passenger = await getCurrentPassenger();
    if (!passenger) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    // ── Validate amount server-side (never trust the client amount) ───────
    const parsedAmount = Number(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount < MIN_AMOUNT_USD) {
      return NextResponse.json(
        { error: `Minimum trip amount is $${MIN_AMOUNT_USD}.` },
        { status: 400 }
      );
    }
    if (parsedAmount > MAX_AMOUNT_USD) {
      return NextResponse.json(
        { error: `Amount exceeds maximum allowed ($${MAX_AMOUNT_USD.toLocaleString()}).` },
        { status: 400 }
      );
    }

    const amountInCents = Math.round(parsedAmount * 100);

    const paymentIntentOptions: any = {
      amount: amountInCents,
      currency: 'usd',
      capture_method: 'manual', // 🔒 Hold funds until destination reached!
      payment_method_types: ['card'],
      metadata: {
        vehicleSlug: vehicleSlug || 'executive-sedan',
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
    });
  } catch (error: any) {
    console.error('PaymentIntent Creation Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create payment hold authorization.' },
      { status: 500 }
    );
  }
}

