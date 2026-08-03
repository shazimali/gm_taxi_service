import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { prisma as globalPrisma } from '@/lib/prisma';
import { signPassengerToken } from '@/lib/passengerAuth';

export async function POST(req: Request) {
  try {
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

    const token = signPassengerToken({
      passengerId: passenger.id,
      email: passenger.email,
      fullName: passenger.fullName,
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
