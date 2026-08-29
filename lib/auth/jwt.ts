/**
 * lib/auth/jwt.ts
 *
 * S — Single Responsibility: this file does ONE thing — JWT sign & verify.
 * D — Dependency Inversion: consumers depend on these functions (abstractions),
 *     not directly on the `jose` library.
 *
 * Previously duplicated in: lib/auth.ts, lib/passengerAuth.ts, lib/authSession.ts
 */

import { SignJWT, jwtVerify } from 'jose';

// ── Secret key helper ──────────────────────────────────────────────────────

function getJwtSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not defined.');
  }
  return new TextEncoder().encode(secret);
}

// ── Sign ───────────────────────────────────────────────────────────────────

/**
 * Sign any payload as a JWT.
 * @param payload  The claims to embed in the token.
 * @param expiresIn  Expiry string accepted by jose, e.g. '24h', '7d'.
 */
export async function signToken(
  payload: Record<string, unknown>,
  expiresIn: '24h' | '7d' = '7d'
): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getJwtSecretKey());
}

// ── Verify ─────────────────────────────────────────────────────────────────

/**
 * Verify a JWT and return its payload, or null if invalid / expired.
 * Never throws — always returns null on failure.
 */
export async function verifyToken<T = Record<string, unknown>>(
  token: string
): Promise<T | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecretKey());
    return payload as unknown as T;
  } catch {
    return null;
  }
}
