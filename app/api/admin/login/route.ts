import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { createAdminToken } from '@/lib/auth';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const limitResult = await rateLimit(`admin_login_${ip}`, 5, 60 * 1000);

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

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await prisma.admin.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const token = await createAdminToken({
      userId: user.id,
      email: user.email,
      name: user.name || 'System Admin',
      role: 'ADMIN',
      tokenVersion: user.tokenVersion || 1,
    });

    const response = NextResponse.json({ success: true, message: 'Authenticated successfully' });
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
