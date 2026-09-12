import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { getCurrentPassenger } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Flat fee charged via Stripe Checkout to confirm a passenger-initiated cancellation.
const CANCELLATION_FEE_USD = 25;

export async function POST(req: Request) {
  try {
    const passenger = await getCurrentPassenger();
    if (!passenger) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookingId } = await req.json();
    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required.' }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking || booking.passengerId !== passenger.id) {
      return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
    }

    if (booking.status === 'CANCELLED' || booking.status === 'COMPLETED') {
      return NextResponse.json({ error: 'This ride can no longer be cancelled.' }, { status: 400 });
    }

    const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const origin = req.headers.get('origin') || (host ? `${protocol}://${host}` : 'http://localhost:3000');

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer: passenger.stripeCustomerId || undefined,
      customer_email: passenger.stripeCustomerId ? undefined : passenger.email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Cancellation Fee — ${booking.serviceType}`,
              description: `Ref: ${booking.confirmationNumber} | Pickup: ${booking.pickupLocation}`,
            },
            unit_amount: Math.round(CANCELLATION_FEE_USD * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        bookingId: booking.id,
        confirmationNumber: booking.confirmationNumber,
        action: 'cancel_ride',
      },
      success_url: `${origin}/dashboard?rideCancelled=1`,
      cancel_url: `${origin}/dashboard?rideActionAborted=1`,
    });

    return NextResponse.json({ success: true, checkoutUrl: session.url });
  } catch (error: any) {
    console.error('[/api/bookings/cancel] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to start cancellation checkout.' },
      { status: 500 }
    );
  }
}
