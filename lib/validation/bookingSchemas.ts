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

export const captureBookingSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required.'),
  capturePercent: z.coerce.number().int().min(1).max(100).optional(),
});

export const updateBookingScheduleSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required.'),
  pickupDate: z.string().min(1, 'Pickup date is required.'),
  pickupTime: z.string().min(1, 'Pickup time is required.'),
});

export const requestCancellationSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required.'),
  reason: z.string().trim().max(1000).optional(),
});

const YMD_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const listBookingsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  status: z.enum(BOOKING_STATUS_VALUES).optional(),
  email: z.string().email().optional(),
  dateFrom: z.string().regex(YMD_REGEX, 'dateFrom must be in yyyy-MM-dd format.').optional(),
  dateTo: z.string().regex(YMD_REGEX, 'dateTo must be in yyyy-MM-dd format.').optional(),
});

export const deleteBookingQuerySchema = z.object({
  id: z.string().min(1, 'Booking ID is required.'),
});

// ── Public pricing & checkout ──────────────────────────────────────────────
// Numeric fields stay loose (number | numeric string | null) because routes
// coerce them with Number() and fall back to defaults; the schema only ensures
// they are primitives, never objects or arrays.

const MAX_VARCHAR = 191; // MySQL maps Prisma `String` to VARCHAR(191)

const looseNumber = z.union([z.number(), z.string().max(20), z.null()]).optional();
const optionalText = (max: number, label: string) =>
  z.string().max(max, `${label} is too long.`).nullish();

export const quoteRequestSchema = z.object(
  {
    vehicleSlug: optionalText(MAX_VARCHAR, 'Vehicle'),
    serviceType: optionalText(150, 'Service type'),
    estimatedMiles: looseNumber,
    estimatedMinutes: looseNumber,
    hourlyCount: looseNumber,
  },
  'Invalid request body.'
);

export const paymentIntentRequestSchema = quoteRequestSchema.extend({
  pickupLocation: optionalText(MAX_VARCHAR, 'Pickup location'),
  dropoffLocation: optionalText(MAX_VARCHAR, 'Dropoff location'),
});

const requiredText = (message: string, max: number, label: string) =>
  z.string(message).trim().min(1, message).max(max, `${label} is too long.`);

export const checkoutSessionSchema = z.object(
  {
    fullName: requiredText('Full name is required.', MAX_VARCHAR, 'Full name'),
    email: z
      .string('A valid email address is required.')
      .trim()
      .max(MAX_VARCHAR, 'Email is too long.')
      .email('A valid email address is required.'),
    phone: optionalText(50, 'Phone number'),
    serviceType: z.string().max(150, 'Service type is too long.').default('Airport Transportation'),
    vehicleSlug: optionalText(MAX_VARCHAR, 'Vehicle'),
    pickupLocation: requiredText('Pickup location is required.', MAX_VARCHAR, 'Pickup location'),
    dropoffLocation: optionalText(MAX_VARCHAR, 'Dropoff location'),
    stops: z.array(z.string().max(MAX_VARCHAR, 'Stop address is too long.')).max(20, 'Too many stops.').nullish(),
    pickupDate: requiredText('Pickup date and time are required.', 50, 'Pickup date'),
    pickupTime: requiredText('Pickup date and time are required.', 50, 'Pickup time'),
    passengers: looseNumber,
    luggage: looseNumber,
    flightNumber: optionalText(50, 'Flight number'),
    specialRequests: optionalText(2000, 'Special requests'),
    estimatedMinutes: looseNumber,
    estimatedMiles: looseNumber,
    hourlyCount: looseNumber,
    tipPercent: looseNumber,
    tipAmount: looseNumber,
  },
  'Invalid request body.'
);
