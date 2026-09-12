import { NextResponse } from 'next/server';
import { getCurrentPassenger } from '@/lib/auth';
import { paymentService } from '@/lib/services/PaymentService';
import { bookingIdSchema } from '@/lib/validation/bookingSchemas';
import { toErrorResponse } from '@/lib/api/errorResponse';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const passenger = await getCurrentPassenger();
    if (!passenger) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookingId } = bookingIdSchema.parse(await req.json());
    const booking = await paymentService.captureForBooking(bookingId, {
      requirePassengerId: passenger.id,
      requireHoldPlaced: true,
    });

    return NextResponse.json({ success: true, booking });
  } catch (error) {
    return toErrorResponse(error, 'Failed to complete ride.');
  }
}
