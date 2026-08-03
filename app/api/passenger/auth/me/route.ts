import { NextResponse } from 'next/server';
import { getCurrentPassenger } from '@/lib/passengerAuth';

export async function GET() {
  try {
    const passenger = await getCurrentPassenger();

    if (!passenger) {
      return NextResponse.json({ authenticated: false, passenger: null }, { status: 200 });
    }

    return NextResponse.json({
      authenticated: true,
      passenger: {
        id: passenger.id,
        fullName: passenger.fullName,
        email: passenger.email,
        phone: passenger.phone,
        stripeCustomerId: passenger.stripeCustomerId,
        createdAt: passenger.createdAt,
      },
    });
  } catch (error) {
    return NextResponse.json({ authenticated: false, passenger: null }, { status: 500 });
  }
}
