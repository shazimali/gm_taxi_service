import { NextResponse } from 'next/server';
import { bookingRepository } from '@/lib/repositories';
import { getAuthenticatedAdmin } from '@/lib/auth';
import { enqueueEmail } from '@/lib/queue/emailQueue';
import {
  listBookingsQuerySchema,
  updateBookingStatusSchema,
  deleteBookingQuerySchema,
} from '@/lib/validation/bookingSchemas';
import { InvalidStateError, NotFoundError } from '@/lib/errors';
import { toErrorResponse } from '@/lib/api/errorResponse';

const ACTIVE_PAYMENT_STATUSES = new Set(['HOLD_PLACED', 'CAPTURED']);

// GET bookings (paginated)
export async function GET(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const { page, limit, status, email } = listBookingsQuerySchema.parse(
      Object.fromEntries(searchParams)
    );

    const bookings = await bookingRepository.findAll({
      status,
      email,
      limit,
      offset: (page - 1) * limit,
    });

    return NextResponse.json({ bookings, page, limit });
  } catch (error) {
    return toErrorResponse(error, 'Failed to fetch bookings');
  }
}

// PUT update booking status
export async function PUT(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, status } = updateBookingStatusSchema.parse(await request.json());

    const existing = await bookingRepository.findById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }
    const wasAlreadyFinal = existing.status === 'COMPLETED' || existing.status === 'CANCELLED';

    const booking = await bookingRepository.updateStatus(id, status);

    if (!wasAlreadyFinal && status === 'COMPLETED') {
      await enqueueEmail('RIDE_COMPLETED_EMAIL', { booking });
    } else if (!wasAlreadyFinal && status === 'CANCELLED') {
      await enqueueEmail('RIDE_CANCELLED_EMAIL', { booking });
    }

    return NextResponse.json({ success: true, booking });
  } catch (error) {
    return toErrorResponse(error, 'Failed to update booking status');
  }
}

// DELETE booking
export async function DELETE(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const { id } = deleteBookingQuerySchema.parse(Object.fromEntries(searchParams));

    const existing = await bookingRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Booking not found');
    }
    if (ACTIVE_PAYMENT_STATUSES.has(existing.paymentStatus)) {
      throw new InvalidStateError(
        'Release or capture/refund the payment before deleting this booking.'
      );
    }

    await bookingRepository.delete(id);

    return NextResponse.json({ success: true, message: 'Booking deleted successfully' });
  } catch (error) {
    return toErrorResponse(error, 'Failed to delete booking');
  }
}
