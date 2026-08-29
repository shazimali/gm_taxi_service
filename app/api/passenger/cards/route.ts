import { NextResponse } from 'next/server';
import { getCurrentPassenger } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET all saved cards for authenticated passenger
export async function GET() {
  try {
    const passenger = await getCurrentPassenger();

    if (!passenger) {
      return NextResponse.json({ cards: [] });
    }

    // 1. Fetch cards saved in MySQL database
    const dbCards = await prisma.passengerCard.findMany({
      where: { passengerId: passenger.id },
      orderBy: { createdAt: 'desc' },
    });

    if (dbCards.length > 0) {
      const cards = dbCards.map((c) => ({
        id: c.stripePaymentMethodId,
        brand: c.brand,
        last4: c.last4,
        expMonth: c.expMonth,
        expYear: c.expYear,
        isDefault: c.isDefault,
      }));
      return NextResponse.json({ cards });
    }

    // 2. Fallback / Sync from Stripe if passenger has a Stripe Customer ID
    if (passenger.stripeCustomerId) {
      const paymentMethods = await stripe.paymentMethods.list({
        customer: passenger.stripeCustomerId,
        type: 'card',
      });

      const stripeCards = paymentMethods.data.map((pm) => ({
        id: pm.id,
        brand: pm.card?.brand || 'card',
        last4: pm.card?.last4 || '0000',
        expMonth: pm.card?.exp_month || 12,
        expYear: pm.card?.exp_year || 2030,
        isDefault: false,
      }));

      return NextResponse.json({ cards: stripeCards });
    }

    return NextResponse.json({ cards: [] });
  } catch (error: any) {
    console.error('Error fetching cards:', error);
    return NextResponse.json({ cards: [] });
  }
}

// POST attach new PaymentMethod & save card metadata to MySQL
export async function POST(req: Request) {
  try {
    const passenger = await getCurrentPassenger();

    if (!passenger) {
      return NextResponse.json({ error: 'Unauthorized passenger' }, { status: 401 });
    }

    const body = await req.json();
    const { paymentMethodId } = body;

    if (!paymentMethodId) {
      return NextResponse.json({ error: 'PaymentMethod ID is required' }, { status: 400 });
    }

    // Ensure Stripe Customer exists
    let customerId = passenger.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: passenger.email,
        name: passenger.fullName,
        phone: passenger.phone || undefined,
        metadata: { passengerId: passenger.id },
      });
      customerId = customer.id;

      // Update Passenger record in MySQL
      await prisma.passenger.update({
        where: { id: passenger.id },
        data: { stripeCustomerId: customerId },
      });
    }

    // Attach PaymentMethod to Customer in Stripe
    const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    // Extract safe metadata (last4, brand, exp)
    const brand = paymentMethod.card?.brand || 'card';
    const last4 = paymentMethod.card?.last4 || '0000';
    const expMonth = paymentMethod.card?.exp_month || 12;
    const expYear = paymentMethod.card?.exp_year || 2030;

    // Save to MySQL passenger_cards table
    const cardRecord = await prisma.passengerCard.upsert({
      where: { stripePaymentMethodId: paymentMethodId },
      update: {
        brand,
        last4,
        expMonth,
        expYear,
      },
      create: {
        passengerId: passenger.id,
        stripePaymentMethodId: paymentMethodId,
        brand,
        last4,
        expMonth,
        expYear,
        isDefault: true,
      },
    });

    return NextResponse.json({
      success: true,
      card: {
        id: cardRecord.stripePaymentMethodId,
        brand: cardRecord.brand,
        last4: cardRecord.last4,
        expMonth: cardRecord.expMonth,
        expYear: cardRecord.expYear,
      },
    });
  } catch (error: any) {
    console.error('Error attaching and saving card:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to save card details.' },
      { status: 500 }
    );
  }
}
