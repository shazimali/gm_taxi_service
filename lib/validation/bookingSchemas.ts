/**
 * lib/validation/bookingSchemas.ts
 *
 * S — Single Responsibility: request-shape validation for booking/payment
 *     routes lives in one place instead of ad-hoc `if (!x)` checks per route.
 */

import { z } from 'zod';

const BOOKING_STATUS_VALUES = [
  'PENDING',
  'CONFIRMED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
] as const;

export const bookingIdSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required.'),
});

export const updateBookingStatusSchema = z.object({
  id: z.string().min(1, 'Booking ID is required.'),
  status: z.enum(BOOKING_STATUS_VALUES),
});

export const listBookingsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  status: z.enum(BOOKING_STATUS_VALUES).optional(),
  email: z.string().email().optional(),
});

export const deleteBookingQuerySchema = z.object({
  id: z.string().min(1, 'Booking ID is required.'),
});
