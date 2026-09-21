import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { adminRepository, passengerRepository } from '@/lib/repositories';
import { hashResetToken } from '@/lib/auth';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const limitResult = await rateLimit(`reset_password_${ip}`, 10, 15 * 60 * 1000);

    if (!limitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': '900' } }
      );
    }

    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json({ error: 'Token and new password are required.' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long.' }, { status: 400 });
    }

    const tokenHash = hashResetToken(token);

    const admin = await adminRepository.findByResetToken(tokenHash);
    if (admin) {
      const passwordHash = await bcrypt.hash(password, 10);
      await adminRepository.resetPassword(admin.id, passwordHash);
      return NextResponse.json({ success: true, message: 'Your password has been reset. Please log in.' });
    }

    const passenger = await passengerRepository.findByResetToken(tokenHash);
    if (passenger) {
      const passwordHash = await bcrypt.hash(password, 10);
      await passengerRepository.resetPassword(passenger.id, passwordHash);
      return NextResponse.json({ success: true, message: 'Your password has been reset. Please log in.' });
    }

    return NextResponse.json({ error: 'This reset link is invalid or has expired.' }, { status: 400 });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
