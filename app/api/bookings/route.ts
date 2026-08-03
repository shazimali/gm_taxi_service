import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    const whereClause = email ? { email: email.toLowerCase() } : {};

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ bookings });
  } catch (error: any) {
    console.error('Fetch Bookings Error:', error);
    return NextResponse.json({ bookings: [] });
  }
}
