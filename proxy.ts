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

async function verifyToken(token: string): Promise<any | null> {
  try {
    const verified = await jwtVerify(token, getJwtSecretKey());
    return verified.payload;
  } catch {
    return null;
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Read all three cookies (same names used in login route)
  const authSessionToken = req.cookies.get('auth_session')?.value;
  const adminToken      = req.cookies.get('admin_token')?.value;
  const passengerToken  = req.cookies.get('passenger_token')?.value;

  // Verify each token (JWT-only, no DB call — proxy runs at the edge)
  const validSession   = authSessionToken ? await verifyToken(authSessionToken) : null;
  const validAdmin     = adminToken       ? await verifyToken(adminToken)       : null;
  const validPassenger = passengerToken   ? await verifyToken(passengerToken)   : null;

  // Resolve identity from most-preferred to least-preferred token
  const session = validSession ?? validAdmin ?? validPassenger ?? null;

  const isAuthenticated = !!session;
  const isAdmin         = isAuthenticated && session?.role === 'ADMIN';
  const isPassenger     = isAuthenticated && session?.role === 'PASSENGER';

  // ── 1. /admin/* ─ Admin-only area ──────────────────────────────────────
  //    No session          → redirect to home (/)
  //    Logged in as PASSENGER → redirect to home (/)
  if (pathname.startsWith('/admin')) {
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/', req.url));
    }
    return NextResponse.next();
  }

  // ── 2. /dashboard ─ Authenticated users only ───────────────────────────
  //    No session           → redirect to home (/)
  //    Admin on /dashboard  → let through (page itself decides where to go)
  //    Passenger on /dashboard → let through
  if (pathname.startsWith('/dashboard')) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/', req.url));
    }
    return NextResponse.next();
  }

  // ── 3. /passenger/* ─ Passenger-only area ───────────────────────────────
  //    No session          → redirect to home (/)
  //    Logged in as ADMIN  → redirect to home (/)
  if (pathname.startsWith('/passenger')) {
    if (!isPassenger) {
      return NextResponse.redirect(new URL('/', req.url));
    }
    return NextResponse.next();
  }

  // ── 4. /login & /register ─ Public pages ───────────────────────────────
  //    If already authenticated, send to dashboard
  if (pathname === '/login' || pathname === '/register') {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    return NextResponse.next();
  }

  // ── 5. Everything else ─ Allow through ────────────────────────────────
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Run on admin, dashboard, passenger, login, register — skip static assets & API
    '/admin/:path*',
    '/dashboard/:path*',
    '/passenger/:path*',
    '/login',
    '/register',
  ],
};
