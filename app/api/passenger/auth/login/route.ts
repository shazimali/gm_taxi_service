import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { prisma as globalPrisma } from '@/lib/prisma';
import { signPassengerToken } from '@/lib/auth';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const limitResult = rateLimit(`passenger_login_${ip}`, 5, 60 * 1000);

    if (!limitResult.success) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again in a minute.' },
        {
          status: 429,
          headers: {
            'Retry-After': '60',
          },
        }
      );
    }

    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Resilient fallback client if dev server cached old Prisma client instance
    const prisma = (globalPrisma as any)?.passenger ? globalPrisma : new PrismaClient();

    const passenger = await prisma.passenger.findUnique({
      where: { email: cleanEmail },
    });

    if (!passenger) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, passenger.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    const token = await signPassengerToken({
      passengerId: passenger.id,
      email: passenger.email,
      fullName: passenger.fullName,
      tokenVersion: passenger.tokenVersion || 1,
    });

    const response = NextResponse.json({
      success: true,
      passenger: {
        id: passenger.id,
        fullName: passenger.fullName,
        email: passenger.email,
        phone: passenger.phone,
        stripeCustomerId: passenger.stripeCustomerId,
      },
    });

    response.cookies.set('passenger_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Login Error:', error);
    return NextResponse.json({ error: 'Failed to process login.' }, { status: 500 });
  }
}
