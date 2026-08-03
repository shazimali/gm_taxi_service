import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getCurrentPassenger } from '@/lib/passengerAuth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, vehicleSlug, pickupLocation, dropoffLocation } = body;

    if (!amount || Number(amount) <= 0) {
      return NextResponse.json({ error: 'Valid trip amount is required.' }, { status: 400 });
    }

    const amountInCents = Math.round(Number(amount) * 100);
    const passenger = await getCurrentPassenger();

    const paymentIntentOptions: any = {
      amount: amountInCents,
      currency: 'usd',
      capture_method: 'manual', // 🔒 Hold funds until destination reached!
      payment_method_types: ['card'],
      metadata: {
        vehicleSlug: vehicleSlug || 'executive-sedan',
        pickupLocation: pickupLocation || '',
        dropoffLocation: dropoffLocation || '',
        passengerId: passenger?.id || 'guest',
      },
    };

    if (passenger?.stripeCustomerId) {
      paymentIntentOptions.customer = passenger.stripeCustomerId;
    }

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentOptions);

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error: any) {
    console.error('PaymentIntent Creation Error:', error);
    return NextResponse.json({ error: 'Failed to create payment hold authorization.' }, { status: 500 });
  }
}
