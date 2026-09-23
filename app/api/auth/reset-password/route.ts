import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { adminRepository, passengerRepository } from '@/lib/repositories';
import { hashResetToken } from '@/lib/auth';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { resetPasswordSchema } from '@/lib/validation/authSchemas';
import { readJsonBody, validationErrorResponse } from '@/lib/api/errorResponse';

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

    const parsed = resetPasswordSchema.safeParse(await readJsonBody(request));
    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }
    const { token, password } = parsed.data;

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
