import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.userId,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.role === 'PASSENGER' ? (user.phone ?? null) : null,
        stripeCustomerId: user.role === 'PASSENGER' ? (user.stripeCustomerId ?? null) : null,
      },
    });
  } catch (error) {
    console.error('Session retrieval error:', error);
    return NextResponse.json({ authenticated: false, user: null }, { status: 500 });
  }
}
