import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { bookingRepository } from '@/lib/repositories';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = await getCurrentUser();

    // ── Anonymous users are not allowed ──────────────────────────────────
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email') ?? undefined;

    // ── Admin: full access via repository, optional email filter ──────────
    if (session.role === 'ADMIN') {
      const bookings = await bookingRepository.findAll({ email });
      return NextResponse.json({ bookings });
    }

    // ── Passenger: scoped to their own bookings only ──────────────────────
    const bookings = await bookingRepository.findByPassengerId(session.userId);
    return NextResponse.json({ bookings });

  } catch (error: any) {
    console.error('Fetch Bookings Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

