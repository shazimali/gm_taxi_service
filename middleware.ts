import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

function getJwtSecretKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not defined.');
  }
  return new TextEncoder().encode(secret);
}

async function verifyToken(token: string): Promise<boolean> {
  try {
    const verified = await jwtVerify(token, getJwtSecretKey());
    return !!verified.payload;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const adminToken = req.cookies.get('admin_token')?.value;
  const passengerToken = req.cookies.get('passenger_token')?.value;

  // 1. ADMIN PAGES
  if (pathname.startsWith('/admin')) {
    const isLogin = pathname === '/admin/login';
    const isAuthenticated = adminToken ? await verifyToken(adminToken) : false;

    if (isLogin && isAuthenticated) {
      return NextResponse.redirect(new URL('/admin', req.url));
    }

    if (!isLogin && !isAuthenticated) {
      const loginUrl = new URL('/admin/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. ADMIN API ENDPOINTS
  if (pathname.startsWith('/api/admin')) {
    const isLoginApi = pathname === '/api/admin/login';
    if (!isLoginApi) {
      const isAuthenticated = adminToken ? await verifyToken(adminToken) : false;
      if (!isAuthenticated) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }
  }

  // 3. PASSENGER PAGES
  if (pathname.startsWith('/passenger')) {
    const isPublicPassengerPage =
      pathname === '/passenger/login' || pathname === '/passenger/register';
    const isAuthenticated = passengerToken ? await verifyToken(passengerToken) : false;

    if (isPublicPassengerPage && isAuthenticated) {
      return NextResponse.redirect(new URL('/passenger/dashboard', req.url));
    }

    if (!isPublicPassengerPage && !isAuthenticated) {
      const loginUrl = new URL('/passenger/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 4. PASSENGER API ENDPOINTS
  if (pathname.startsWith('/api/passenger')) {
    const isPublicPassengerApi =
      pathname === '/api/passenger/auth/login' ||
      pathname === '/api/passenger/auth/register' ||
      pathname === '/api/passenger/auth/logout';

    if (!isPublicPassengerApi) {
      const isAuthenticated = passengerToken ? await verifyToken(passengerToken) : false;
      if (!isAuthenticated) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/passenger/:path*',
    '/api/admin/:path*',
    '/api/passenger/:path*',
  ],
};
