import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { bookingId } = await req.json();

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required.' }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
    }

    if (booking.stripePaymentIntentId) {
      try {
        await stripe.paymentIntents.cancel(booking.stripePaymentIntentId);
      } catch (stripeErr: any) {
        console.warn('Stripe cancel hold warning:', stripeErr.message);
      }
    }

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        paymentStatus: 'CANCELLED_RELEASED',
        status: 'CANCELLED',
      },
    });

    return NextResponse.json({ success: true, booking: updated });
  } catch (error: any) {
    console.error('Cancel Hold Error:', error);
    return NextResponse.json({ error: 'Failed to release hold.' }, { status: 500 });
  }
}
