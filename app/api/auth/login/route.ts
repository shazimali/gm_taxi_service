import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { createSessionToken } from '@/lib/auth';
import { createAdminToken } from '@/lib/auth';
import { signPassengerToken } from '@/lib/auth';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { PrismaClient } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const limitResult = await rateLimit(`unified_login_${ip}`, 10, 60 * 1000);

    if (!limitResult.success) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again in a minute.' },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. Try Admin Login
    const adminUser = await prisma.admin.findUnique({
      where: { email: cleanEmail },
    });

    if (adminUser) {
      const passwordMatch = await bcrypt.compare(password, adminUser.password);
      if (passwordMatch) {
        const sessionPayload = {
          userId: adminUser.id,
          email: adminUser.email,
          name: adminUser.name || 'System Admin',
          role: 'ADMIN' as const,
          tokenVersion: adminUser.tokenVersion || 1,
        };

        const sessionToken = await createSessionToken(sessionPayload);
        const adminToken = await createAdminToken(sessionPayload);

        const response = NextResponse.json({
          success: true,
          user: {
            id: adminUser.id,
            email: adminUser.email,
            name: adminUser.name || 'System Admin',
            role: 'ADMIN',
          },
          redirectTo: '/dashboard',
        });

        // Set unified auth cookie
        response.cookies.set('auth_session', sessionToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60,
          path: '/',
        });

        // Set legacy admin cookie for existing admin api routes
        response.cookies.set('admin_token', adminToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 24 * 60 * 60,
          path: '/',
        });

        return response;
      }
    }

    // 2. Try Passenger Login
    const prismaClient = (prisma as any)?.passenger ? prisma : new PrismaClient();
    const passengerUser = await prismaClient.passenger.findUnique({
      where: { email: cleanEmail },
    });

    if (passengerUser) {
      const passwordMatch = await bcrypt.compare(password, passengerUser.passwordHash);
      if (passwordMatch) {
        const sessionPayload = {
          userId: passengerUser.id,
          email: passengerUser.email,
          name: passengerUser.fullName,
          phone: passengerUser.phone || undefined,
          stripeCustomerId: passengerUser.stripeCustomerId || undefined,
          role: 'PASSENGER' as const,
          tokenVersion: passengerUser.tokenVersion || 1,
        };

        const sessionToken = await createSessionToken(sessionPayload);
        const passToken = await signPassengerToken({
          passengerId: passengerUser.id,
          email: passengerUser.email,
          fullName: passengerUser.fullName,
          tokenVersion: passengerUser.tokenVersion || 1,
        });

        const response = NextResponse.json({
          success: true,
          user: {
            id: passengerUser.id,
            email: passengerUser.email,
            name: passengerUser.fullName,
            phone: passengerUser.phone,
            role: 'PASSENGER',
          },
          redirectTo: '/dashboard',
        });

        // Set unified auth cookie
        response.cookies.set('auth_session', sessionToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60,
          path: '/',
        });

        // Set legacy passenger cookie
        response.cookies.set('passenger_token', passToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60,
          path: '/',
        });

        return response;
      }
    }

    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  } catch (error) {
    console.error('Unified login error:', error);
    return NextResponse.json({ error: 'Internal server error during authentication' }, { status: 500 });
  }
}
