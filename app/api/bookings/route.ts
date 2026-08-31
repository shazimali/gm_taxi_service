import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = await getCurrentUser();

    // ── Anonymous users are not allowed ──────────────────────────────────
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    // ── Admin: full access, optional email filter ─────────────────────────
    if (session.role === 'ADMIN') {
      const whereClause = email ? { email: email.toLowerCase() } : {};
      const bookings = await prisma.booking.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json({ bookings });
    }

    // ── Passenger: scoped to their own bookings only ──────────────────────
    const bookings = await prisma.booking.findMany({
      where: { passengerId: session.userId },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ bookings });

  } catch (error: any) {
    console.error('Fetch Bookings Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
