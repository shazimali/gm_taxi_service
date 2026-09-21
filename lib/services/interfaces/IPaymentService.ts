/**
 * lib/services/interfaces/IPaymentService.ts
 *
 * D — Dependency Inversion: every route that captures/releases a Stripe
 *     hold or processes a Stripe webhook depends on this contract, not on
 *     the Stripe SDK or Prisma directly.
 */

import type Stripe from 'stripe';
import type { Booking } from '@/lib/repositories/interfaces/IBookingRepository';

export interface CaptureOptions {
  /** Restricts the operation to a booking owned by this passenger (404s otherwise). */
  requirePassengerId?: string;
  /** Rejects the capture unless the booking currently has an active hold. */
  requireHoldPlaced?: boolean;
  /** Percentage (1-100) of the authorized hold to capture. Defaults to 100 (full capture). */
  capturePercent?: number;
}

export interface ReleaseHoldOptions {
  /** Restricts the operation to a booking owned by this passenger (404s otherwise). */
  requirePassengerId?: string;
}

export interface IPaymentService {
  /** Captures the Stripe hold for a booking and marks it COMPLETED/CAPTURED. */
  captureForBooking(bookingId: string, options?: CaptureOptions): Promise<Booking>;

  /** Cancels the Stripe hold for a booking and marks it CANCELLED/CANCELLED_RELEASED. */
  releaseHoldForBooking(bookingId: string, options?: ReleaseHoldOptions): Promise<Booking>;

  /** Applies a verified Stripe webhook event, idempotently. */
  handleWebhookEvent(event: Stripe.Event): Promise<void>;
}
