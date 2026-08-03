import { NextResponse } from 'next/server';
import { getCurrentPassenger } from '@/lib/passengerAuth';
import { stripe } from '@/lib/stripe';

export async function GET() {
  try {
    const passenger = await getCurrentPassenger();

    if (!passenger || !passenger.stripeCustomerId) {
      return NextResponse.json({ cards: [] });
    }

    const paymentMethods = await stripe.paymentMethods.list({
      customer: passenger.stripeCustomerId,
      type: 'card',
    });

    const cards = paymentMethods.data.map((pm) => ({
      id: pm.id,
      brand: pm.card?.brand,
      last4: pm.card?.last4,
      expMonth: pm.card?.exp_month,
      expYear: pm.card?.exp_year,
    }));

    return NextResponse.json({ cards });
  } catch (error: any) {
    console.error('Error fetching cards:', error);
    return NextResponse.json({ cards: [] });
  }
}

export async function POST() {
  try {
    const passenger = await getCurrentPassenger();

    if (!passenger) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let customerId = passenger.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: passenger.email,
        name: passenger.fullName,
        phone: passenger.phone || undefined,
      });
      customerId = customer.id;
    }

    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card'],
    });

    return NextResponse.json({ clientSecret: setupIntent.client_secret });
  } catch (error: any) {
    console.error('Error creating setup intent:', error);
    return NextResponse.json({ error: 'Failed to initialize card setup.' }, { status: 500 });
  }
}
