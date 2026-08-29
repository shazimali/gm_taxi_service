/**
 * lib/auth/guards.ts
 *
 * S — Single Responsibility: route-level auth guards only.
 *     Each function answers one question: "Is the current user X?"
 * D — Dependency Inversion: uses repositories (adminRepository, passengerRepository)
 *     rather than calling Prisma directly.
 *
 * Replaces: getAuthenticatedAdmin() from lib/auth.ts
 *           getCurrentPassenger()   from lib/passengerAuth.ts
 */

import { adminRepository, passengerRepository } from '@/lib/repositories';
import { AdminSession } from './types';
import { getCurrentUser } from './session';

// ── Admin guard ────────────────────────────────────────────────────────────

/**
 * Returns the authenticated admin session, or null.
 * Use in /api/admin/* route handlers.
 *
 * @example
 * const admin = await getAuthenticatedAdmin();
 * if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 */
export async function getAuthenticatedAdmin(): Promise<AdminSession | null> {
  const session = await getCurrentUser();
  if (!session || session.role !== 'ADMIN') return null;
  return session;
}

/**
 * Revoke all sessions for an admin by incrementing tokenVersion.
 * All existing tokens are immediately invalidated on next DB check.
 */
export async function revokeAdminSessions(userId: string): Promise<boolean> {
  try {
    await adminRepository.incrementTokenVersion(userId);
    return true;
  } catch {
    return false;
  }
}

// ── Passenger guard ────────────────────────────────────────────────────────

/**
 * Returns the authenticated passenger's DB record, or null.
 * Use in /api/passenger/* route handlers.
 *
 * @example
 * const passenger = await getCurrentPassenger();
 * if (!passenger) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 */
export async function getCurrentPassenger(): Promise<any | null> {
  const session = await getCurrentUser();
  if (!session || session.role !== 'PASSENGER') return null;

  try {
    return await passengerRepository.findById(session.userId);
  } catch {
    return null;
  }
}

/**
 * Revoke all sessions for a passenger by incrementing tokenVersion.
 */
export async function revokePassengerSessions(passengerId: string): Promise<boolean> {
  try {
    await passengerRepository.incrementTokenVersion(passengerId);
    return true;
  } catch {
    return false;
  }
}
