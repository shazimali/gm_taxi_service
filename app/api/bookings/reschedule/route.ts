import { NextResponse } from 'next/server';
import { getCurrentPassenger } from '@/lib/auth';
import { bookingRepository } from '@/lib/repositories';
import { updateBookingScheduleSchema } from '@/lib/validation/bookingSchemas';
import { toErrorResponse } from '@/lib/api/errorResponse';
import { NotFoundError, InvalidStateError } from '@/lib/errors';
import { enqueueEmail } from '@/lib/queue/emailQueue';

export const dynamic = 'force-dynamic';

const NON_RESCHEDULABLE_STATUSES = new Set(['IN_PROGRESS', 'COMPLETED', 'CANCELLED']);

export async function POST(req: Request) {
  try {
    const passenger = await getCurrentPassenger();
    if (!passenger) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookingId, pickupDate, pickupTime } = updateBookingScheduleSchema.parse(await req.json());

    const booking = await bookingRepository.findById(bookingId);
    if (!booking || booking.passengerId !== passenger.id) {
      throw new NotFoundError('Booking not found.');
    }

    if (NON_RESCHEDULABLE_STATUSES.has(booking.status)) {
      throw new InvalidStateError('This ride can no longer be rescheduled.');
    }

    const previousPickupDate = booking.pickupDate;
    const previousPickupTime = booking.pickupTime;

    const updated = await bookingRepository.updateSchedule(bookingId, { pickupDate, pickupTime });

    await enqueueEmail('RIDE_RESCHEDULED_EMAIL', {
      booking: {
        confirmationNumber: updated.confirmationNumber,
        fullName: updated.fullName,
        email: updated.email,
        serviceType: updated.serviceType,
        pickupLocation: updated.pickupLocation,
        pickupDate: updated.pickupDate,
        pickupTime: updated.pickupTime,
      },
      previousPickupDate,
      previousPickupTime,
    });

    return NextResponse.json({ success: true, booking: updated });
  } catch (error) {
    return toErrorResponse(error, 'Failed to update ride time.');
  }
}
