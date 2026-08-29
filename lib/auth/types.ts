/**
 * lib/auth/types.ts
 *
 * S — Single Responsibility: this file owns ALL auth-related type definitions.
 * I — Interface Segregation: discriminated union lets each consumer narrow to
 *     only the fields it actually needs, with full TypeScript enforcement.
 */

// ── Discriminated union for session payload ─────────────────────────────────
// Role is the discriminant: `session.role === 'ADMIN'` narrows to AdminSession,
// removing the need for `any` casts or optional-chaining on role-specific fields.

export interface AdminSession {
  role: 'ADMIN';
  userId: string;
  email: string;
  name: string;
  tokenVersion?: number;
}

export interface PassengerSession {
  role: 'PASSENGER';
  userId: string;
  email: string;
  name: string;
  phone?: string;
  stripeCustomerId?: string;
  tokenVersion?: number;
}

/** Union type — use `session.role` to narrow to the correct variant */
export type UserSession = AdminSession | PassengerSession;

// ── Legacy-compatible flat payload (used by existing admin token creation) ──
export interface AdminJwtPayload {
  userId: string;
  email: string;
  name: string;
  role: 'ADMIN';
  tokenVersion?: number;
}

export interface PassengerJwtPayload {
  passengerId: string;
  email: string;
  fullName: string;
  tokenVersion?: number;
}

// ── Cookie names (single source of truth) ──────────────────────────────────
export const COOKIE_NAMES = {
  SESSION:   'auth_session',
  ADMIN:     'admin_token',
  PASSENGER: 'passenger_token',
} as const;

// ── Cookie options ─────────────────────────────────────────────────────────
export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};
