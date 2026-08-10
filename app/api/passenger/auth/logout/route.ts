import { NextResponse } from 'next/server';
import { getCurrentPassenger, revokePassengerSessions } from '@/lib/passengerAuth';

export async function POST() {
  const passenger = await getCurrentPassenger();
  if (passenger?.id) {
    await revokePassengerSessions(passenger.id);
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set('passenger_token', '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  });
  return response;
}
