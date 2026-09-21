/**
 * lib/auth/resetToken.ts
 *
 * S — Single Responsibility: generates and hashes password-reset tokens.
 *
 * The raw token is emailed to the user and never stored; only its SHA-256
 * hash is persisted (resetTokenHash), so a leaked/dumped database can't be
 * used to reset accounts. Analogous to how session tokens are never stored
 * server-side, only their signature is verified.
 */

import { randomBytes, createHash } from 'crypto';

export const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

/** Generate a random, URL-safe reset token to embed in the email link. */
export function generateResetToken(): string {
  return randomBytes(32).toString('hex');
}

/** Hash a raw reset token for storage/lookup (never store the raw token). */
export function hashResetToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
