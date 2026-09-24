/**
 * lib/auth/welcomePassword.ts
 *
 * S — Single Responsibility: issues the temporary password for passengers
 *     auto-registered during guest checkout.
 *
 * At checkout the account is created with a placeholder hash of a random
 * secret nobody knows, so it can't be logged into. Only that (non-secret)
 * placeholder hash travels through Stripe metadata — never a plaintext
 * password. Once payment succeeds, the webhook or the thank-you page swaps
 * the placeholder for a real temporary password and emails it. The swap is
 * compare-and-swap on the placeholder, so whichever runs first wins, the
 * other is a no-op, and a password the passenger already set via
 * "forgot password" is never overwritten.
 */

import { randomBytes, randomInt } from 'crypto';
import bcrypt from 'bcryptjs';
import { passengerRepository } from '@/lib/repositories';

// No 0/O/1/I to keep the emailed password easy to type.
const TEMP_PASSWORD_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateTempPassword(): string {
  let chars = '';
  for (let i = 0; i < 6; i++) {
    chars += TEMP_PASSWORD_ALPHABET[randomInt(TEMP_PASSWORD_ALPHABET.length)];
  }
  return `GM-${chars}!${randomInt(100, 1000)}`;
}

/** Hash of a random, discarded secret — an account with it can't be logged into. */
export async function createPlaceholderPasswordHash(): Promise<string> {
  return bcrypt.hash(randomBytes(32).toString('hex'), 10);
}

/**
 * Replace the checkout placeholder with a fresh temporary password.
 * Returns the plaintext password to email, or null if it was already issued
 * (or the passenger has since set their own password).
 */
export async function issueWelcomePassword(
  passengerId: string,
  placeholderHash: string
): Promise<string | null> {
  const tempPassword = generateTempPassword();
  const tempHash = await bcrypt.hash(tempPassword, 10);
  const swapped = await passengerRepository.replacePasswordIfUnchanged(passengerId, placeholderHash, tempHash);
  return swapped ? tempPassword : null;
}
