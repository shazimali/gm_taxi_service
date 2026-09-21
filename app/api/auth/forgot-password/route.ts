import { NextResponse } from 'next/server';
import { adminRepository, passengerRepository } from '@/lib/repositories';
import { generateResetToken, hashResetToken, RESET_TOKEN_TTL_MS } from '@/lib/auth';
import { enqueueEmail } from '@/lib/queue/emailQueue';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

// Generic response for both the "account exists" and "account doesn't exist"
// cases, so this endpoint can't be used to enumerate registered emails.
const GENERIC_MESSAGE = 'If an account exists with that email, a password reset link has been sent.';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const limitResult = await rateLimit(`forgot_password_${ip}`, 5, 15 * 60 * 1000);

    if (!limitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': '900' } }
      );
    }

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const origin = new URL(request.url).origin;

    const admin = await adminRepository.findByEmail(cleanEmail);
    if (admin) {
      const rawToken = generateResetToken();
      await adminRepository.setResetToken(admin.id, hashResetToken(rawToken), new Date(Date.now() + RESET_TOKEN_TTL_MS));
      await enqueueEmail('PASSWORD_RESET_EMAIL', {
        name: admin.name || 'Administrator',
        email: admin.email,
        resetUrl: `${origin}/reset-password?token=${rawToken}`,
      });
      return NextResponse.json({ success: true, message: GENERIC_MESSAGE });
    }

    const passenger = await passengerRepository.findByEmail(cleanEmail);
    if (passenger) {
      const rawToken = generateResetToken();
      await passengerRepository.setResetToken(passenger.id, hashResetToken(rawToken), new Date(Date.now() + RESET_TOKEN_TTL_MS));
      await enqueueEmail('PASSWORD_RESET_EMAIL', {
        name: passenger.fullName,
        email: passenger.email,
        resetUrl: `${origin}/reset-password?token=${rawToken}`,
      });
      return NextResponse.json({ success: true, message: GENERIC_MESSAGE });
    }

    return NextResponse.json({ success: true, message: GENERIC_MESSAGE });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
