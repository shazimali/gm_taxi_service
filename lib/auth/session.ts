/**
 * lib/auth/session.ts
 *
 * S — Single Responsibility: reads & writes HTTP cookies. Nothing else.
 * D — Dependency Inversion: uses repositories (adminRepository, passengerRepository)
 *     for data resolution instead of direct Prisma calls.
 *
 * Replaces: scattered cookie.set() calls across 3+ route files.
 */

import { cookies } from 'next/headers';
import { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';
import {
  AdminJwtPayload,
  AdminSession,
  COOKIE_NAMES,
  COOKIE_OPTIONS,
  PassengerJwtPayload,
  PassengerSession,
  UserSession,
} from './types';
import { signToken, verifyToken } from './jwt';
import { adminRepository, passengerRepository } from '@/lib/repositories';

// ── Shared maxAge constants ────────────────────────────────────────────────

const SEVEN_DAYS  = 7 * 24 * 60 * 60;
const ONE_DAY     = 24 * 60 * 60;

// ── Token creation helpers ─────────────────────────────────────────────────

/** Create a unified session token (7d) — used by both admin and passenger login */
export async function createSessionToken(payload: UserSession): Promise<string> {
  return signToken({ ...payload }, '7d');
}

/** Create a legacy admin-specific token (24h) — used by /api/admin/login */
export async function createAdminToken(payload: AdminJwtPayload): Promise<string> {
  return signToken({ ...payload }, '24h');
}

/** Create a legacy passenger-specific token (7d) — used by passenger login/register */
export async function signPassengerToken(payload: PassengerJwtPayload): Promise<string> {
  return signToken({ ...payload }, '7d');
}

// ── Cookie writers ─────────────────────────────────────────────────────────

const baseCookieOptions: Partial<ResponseCookie> = {
  ...COOKIE_OPTIONS,
};

/**
 * Set all cookies for an authenticated admin.
 * Call this on the NextResponse object after admin login.
 */
export function setAdminCookies(
  response: { cookies: { set: (name: string, value: string, options: Partial<ResponseCookie>) => void } },
  sessionToken: string,
  adminToken: string
): void {
  response.cookies.set(COOKIE_NAMES.SESSION, sessionToken, {
    ...baseCookieOptions,
    maxAge: SEVEN_DAYS,
  });
  response.cookies.set(COOKIE_NAMES.ADMIN, adminToken, {
    ...baseCookieOptions,
    maxAge: ONE_DAY,
  });
}

/**
 * Set all cookies for an authenticated passenger.
 * Call this on the NextResponse object after passenger login/register.
 */
export function setPassengerCookies(
  response: { cookies: { set: (name: string, value: string, options: Partial<ResponseCookie>) => void } },
  sessionToken: string,
  passengerToken: string
): void {
  response.cookies.set(COOKIE_NAMES.SESSION, sessionToken, {
    ...baseCookieOptions,
    maxAge: SEVEN_DAYS,
  });
  response.cookies.set(COOKIE_NAMES.PASSENGER, passengerToken, {
    ...baseCookieOptions,
    maxAge: SEVEN_DAYS,
  });
}

/**
 * Clear all auth cookies (logout).
 * Call this on the NextResponse object.
 */
export function clearAuthCookies(
  response: { cookies: { set: (name: string, value: string, options: Partial<ResponseCookie>) => void } }
): void {
  const expired = { ...baseCookieOptions, maxAge: 0 };
  response.cookies.set(COOKIE_NAMES.SESSION,   '', expired);
  response.cookies.set(COOKIE_NAMES.ADMIN,     '', expired);
  response.cookies.set(COOKIE_NAMES.PASSENGER, '', expired);
}

// ── Session resolution ─────────────────────────────────────────────────────

/**
 * Read and verify the current user session from request cookies.
 * Priority: auth_session → admin_token → passenger_token (backward compat).
 * Performs a DB check on tokenVersion to detect revoked sessions.
 *
 * Returns null if no valid session exists.
 */
export async function getCurrentUser(): Promise<UserSession | null> {
  const cookieStore = await cookies();

  // 1. Primary: unified auth_session
  const sessionToken = cookieStore.get(COOKIE_NAMES.SESSION)?.value;
  if (sessionToken) {
    const payload = await verifyToken<UserSession>(sessionToken);
    if (payload?.userId && payload?.role) {
      const user = await resolveUserFromDb(payload);
      if (user) return user;
    }
  }

  // 2. Fallback: legacy admin_token
  const adminToken = cookieStore.get(COOKIE_NAMES.ADMIN)?.value;
  if (adminToken) {
    const payload = await verifyToken<AdminJwtPayload>(adminToken);
    if (payload?.userId) {
      const session: AdminSession = {
        role: 'ADMIN',
        userId: payload.userId,
        email: payload.email,
        name: payload.name,
        tokenVersion: payload.tokenVersion,
      };
      const user = await resolveUserFromDb(session);
      if (user) return user;
    }
  }

  // 3. Fallback: legacy passenger_token
  const passengerToken = cookieStore.get(COOKIE_NAMES.PASSENGER)?.value;
  if (passengerToken) {
    const payload = await verifyToken<PassengerJwtPayload>(passengerToken);
    if (payload) {
      const passId = (payload as any).passengerId || (payload as any).userId;
      if (passId) {
        const session: PassengerSession = {
          role: 'PASSENGER',
          userId: passId,
          email: payload.email,
          name: payload.fullName,
          tokenVersion: payload.tokenVersion,
        };
        const user = await resolveUserFromDb(session);
        if (user) return user;
      }
    }
  }

  return null;
}

// ── Internal DB resolution (via Repositories) ──────────────────────────────

async function resolveUserFromDb(session: UserSession): Promise<UserSession | null> {
  if (session.role === 'ADMIN') {
    return resolveAdmin(session);
  }
  return resolvePassenger(session);
}

async function resolveAdmin(session: AdminSession): Promise<AdminSession | null> {
  try {
    const admin = await adminRepository.findById(session.userId);
    if (!admin) return null;
    if (session.tokenVersion !== undefined && admin.tokenVersion !== session.tokenVersion) {
      return null; // Session revoked
    }
    return {
      role: 'ADMIN',
      userId: admin.id,
      email: admin.email,
      name: admin.name || 'Administrator',
      tokenVersion: admin.tokenVersion,
    };
  } catch {
    return null;
  }
}

async function resolvePassenger(session: PassengerSession): Promise<PassengerSession | null> {
  try {
    const passenger = await passengerRepository.findById(session.userId);
    if (!passenger) return null;
    if (session.tokenVersion !== undefined && passenger.tokenVersion !== session.tokenVersion) {
      return null; // Session revoked
    }
    return {
      role: 'PASSENGER',
      userId: passenger.id,
      email: passenger.email,
      name: passenger.fullName,
      phone: passenger.phone ?? undefined,
      stripeCustomerId: passenger.stripeCustomerId ?? undefined,
      tokenVersion: passenger.tokenVersion,
    };
  } catch {
    return null;
  }
}
