/**
 * lib/validation/authSchemas.ts
 *
 * S — Single Responsibility: request-shape validation for login, registration
 *     and password-reset routes. Guarantees every field is a plain string
 *     before it reaches bcrypt or Prisma.
 */

import { z } from 'zod';

// MySQL maps Prisma `String` to VARCHAR(191)
const MAX_VARCHAR = 191;
const MAX_PASSWORD = 200;

/** A string that must be present and non-blank, with one message for every failure. */
export function requiredString(message: string) {
  return z.string(message).trim().min(1, message);
}

export const loginSchema = z.object(
  {
    email: requiredString('Email and password are required.').max(MAX_VARCHAR, 'Email is too long.'),
    password: z.string('Email and password are required.').min(1, 'Email and password are required.').max(MAX_PASSWORD, 'Password is too long.'),
  },
  'Invalid request body.'
);

export const registerSchema = z.object(
  {
    fullName: requiredString('Full name, email, and password are required.').max(MAX_VARCHAR, 'Full name is too long.'),
    email: requiredString('Full name, email, and password are required.').max(MAX_VARCHAR, 'Email is too long.'),
    password: z.string('Full name, email, and password are required.').min(1, 'Full name, email, and password are required.').max(MAX_PASSWORD, 'Password is too long.'),
    phone: z.string().trim().max(50, 'Phone number is too long.').nullish(),
  },
  'Invalid request body.'
);

export const forgotPasswordSchema = z.object(
  {
    email: requiredString('Email is required.').max(MAX_VARCHAR, 'Email is too long.'),
  },
  'Invalid request body.'
);

export const resetPasswordSchema = z.object(
  {
    token: requiredString('Token and new password are required.').max(MAX_VARCHAR, 'This reset link is invalid or has expired.'),
    password: z
      .string('Token and new password are required.')
      .min(1, 'Token and new password are required.')
      .min(8, 'Password must be at least 8 characters long.')
      .max(MAX_PASSWORD, 'Password is too long.'),
  },
  'Invalid request body.'
);
