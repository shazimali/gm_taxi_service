import { NextResponse } from 'next/server';
import { bookingRepository } from '@/lib/repositories';
import { getAuthenticatedAdmin } from '@/lib/auth';
import {
  listBookingsQuerySchema,
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
