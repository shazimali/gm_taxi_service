import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { prisma as globalPrisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { signPassengerToken } from '@/lib/passengerAuth';
import { enqueueEmail } from '@/lib/queue/emailQueue';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fullName, email, password, phone } = body;

    if (!fullName || !email || !password) {
      return NextResponse.json({ error: 'Full name, email, and password are required.' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Resilient fallback client if dev server cached old Prisma client instance
    const prisma = (globalPrisma as any)?.passenger ? globalPrisma : new PrismaClient();

    const existing = await prisma.passenger.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists. Please log in.' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Create Stripe Customer in Vault if valid key configured
    let stripeCustomerId: string | null = null;
    const stripeKey = process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET;
    if (stripeKey && stripeKey.startsWith('sk_')) {
      try {
        const customer = await stripe.customers.create({
          email: cleanEmail,
          name: fullName,
          phone: phone || undefined,
        });
        stripeCustomerId = customer.id;
      } catch (stripeErr: any) {
        console.warn('Stripe customer creation warning:', stripeErr?.message);
      }
    }

    const passenger = await prisma.passenger.create({
      data: {
        fullName,
        email: cleanEmail,
        passwordHash,
        phone: phone || null,
        stripeCustomerId: stripeCustomerId || null,
      },
    });

    // Enqueue Welcome Email Job to BullMQ Redis Queue
    await enqueueEmail('WELCOME_EMAIL', {
      passengerName: passenger.fullName,
      email: passenger.email,
    });

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
    console.error('Registration Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create passenger account.' },
      { status: 500 }
    );
  }
}
