import { NextResponse } from 'next/server';
import { getAuthenticatedAdmin } from '@/lib/auth';
import { paymentService } from '@/lib/services/PaymentService';
import { captureBookingSchema } from '@/lib/validation/bookingSchemas';
import { toErrorResponse } from '@/lib/api/errorResponse';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized. Admin privileges required.' }, { status: 401 });
    }

    const { bookingId, capturePercent } = captureBookingSchema.parse(await req.json());
    const booking = await paymentService.captureForBooking(bookingId, { capturePercent });

    return NextResponse.json({ success: true, booking });
  } catch (error) {
    return toErrorResponse(error, 'Failed to capture payment.');
  }
}
