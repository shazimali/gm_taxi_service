import { NextResponse } from 'next/server';
import { getCurrentPassenger } from '@/lib/auth';
import { bookingRepository } from '@/lib/repositories';
import { requestCancellationSchema } from '@/lib/validation/bookingSchemas';
import { toErrorResponse } from '@/lib/api/errorResponse';
import { NotFoundError, InvalidStateError } from '@/lib/errors';
import { enqueueEmail } from '@/lib/queue/emailQueue';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const passenger = await getCurrentPassenger();
    if (!passenger) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookingId, reason } = requestCancellationSchema.parse(await req.json());

    const booking = await bookingRepository.findById(bookingId);
    if (!booking || booking.passengerId !== passenger.id) {
      throw new NotFoundError('Booking not found.');
    }

    if (booking.status === 'COMPLETED' || booking.status === 'CANCELLED') {
      throw new InvalidStateError('This ride can no longer be cancelled.');
    }

    // Passengers can only request a cancellation — the hold is not released
    // and the booking is not changed here. An admin reviews the request and
    // performs the actual cancellation (which releases the hold) from the
    // admin bookings dashboard.
    await enqueueEmail('RIDE_CANCELLATION_REQUESTED_EMAIL', { booking, reason });

    return NextResponse.json({ success: true });
  } catch (error) {
    return toErrorResponse(error, 'Failed to submit cancellation request.');
  }
}
