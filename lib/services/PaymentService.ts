/**
 * lib/services/PaymentService.ts
 *
 * S — Single Responsibility: the one place that mutates a booking's payment
 *     state — capture, release, or webhook-driven — replacing five separate
 *     copies of the same Stripe+DB logic previously inlined per route.
 * D — Dependency Inversion: depends on IBookingRepository /
 *     IProcessedStripeEventRepository and the Stripe client, all injectable.
 * O — Open/Closed: new Stripe event types are added inside
 *     `applyWebhookEvent` without touching the public API or callers.
 */

import type Stripe from 'stripe';
import { stripe as defaultStripeClient } from '@/lib/stripe';
import {
  bookingRepository,
  processedStripeEventRepository,
  type IBookingRepository,
  type IProcessedStripeEventRepository,
  type Booking,
} from '@/lib/repositories';
import { enqueueEmail } from '@/lib/queue/emailQueue';
import { parseStops } from '@/lib/utils/stops';
import { NotFoundError, InvalidStateError, PaymentProviderError } from '@/lib/errors';
import type {
  IPaymentService,
  CaptureOptions,
  ReleaseHoldOptions,
} from './interfaces/IPaymentService';

const TERMINAL_STATUSES = new Set(['COMPLETED', 'CANCELLED']);

export class PaymentService implements IPaymentService {
  constructor(
    private readonly bookingRepo: IBookingRepository = bookingRepository,
    private readonly processedEventRepo: IProcessedStripeEventRepository = processedStripeEventRepository,
    private readonly stripe: Stripe = defaultStripeClient
  ) {}

  async captureForBooking(bookingId: string, options: CaptureOptions = {}): Promise<Booking> {
    const booking = await this.loadBookingForMutation(bookingId, options.requirePassengerId);

    if (options.requireHoldPlaced && booking.paymentStatus !== 'HOLD_PLACED') {
      throw new InvalidStateError('This ride does not have an active payment hold to finalize.');
    }

    if (booking.stripePaymentIntentId) {
      await this.ensurePaymentIntentReachesState(
        booking.stripePaymentIntentId,
        (id) => this.stripe.paymentIntents.capture(id),
        'succeeded',
        'capture'
      );
    }

    const updated = await this.bookingRepo.updatePaymentOutcome(bookingId, {
      status: 'COMPLETED',
      paymentStatus: 'CAPTURED',
    });

    await enqueueEmail('RIDE_COMPLETED_EMAIL', { booking: updated });
    return updated;
  }

  async releaseHoldForBooking(bookingId: string, options: ReleaseHoldOptions = {}): Promise<Booking> {
    const booking = await this.loadBookingForMutation(bookingId, options.requirePassengerId);

    if (booking.stripePaymentIntentId) {
      await this.ensurePaymentIntentReachesState(
        booking.stripePaymentIntentId,
        (id) => this.stripe.paymentIntents.cancel(id),
        'canceled',
        'cancel'
      );
    }

    const updated = await this.bookingRepo.updatePaymentOutcome(bookingId, {
      status: 'CANCELLED',
      paymentStatus: 'CANCELLED_RELEASED',
    });

    await enqueueEmail('RIDE_CANCELLED_EMAIL', { booking: updated });
    return updated;
  }

  async handleWebhookEvent(event: Stripe.Event): Promise<void> {
    if (await this.processedEventRepo.hasBeenProcessed(event.id)) {
      console.log(`[PaymentService] Ignoring already-processed Stripe event ${event.id} (${event.type})`);
      return;
    }

    await this.applyWebhookEvent(event);
    await this.processedEventRepo.markProcessed(event.id, event.type);
  }

  // ── Internal helpers ───────────────────────────────────────────────────

  private async loadBookingForMutation(
    bookingId: string,
    requirePassengerId?: string
  ): Promise<Booking> {
    const booking = await this.bookingRepo.findById(bookingId);
    if (!booking || (requirePassengerId && booking.passengerId !== requirePassengerId)) {
      // Same 404 whether the booking is missing or owned by someone else —
      // avoids leaking whether a given booking ID exists.
      throw new NotFoundError('Booking not found.');
    }
    if (TERMINAL_STATUSES.has(booking.status)) {
      throw new InvalidStateError('This ride is already in a final state and cannot be modified.');
    }
    return booking;
  }

  /**
   * Runs a Stripe mutation by PaymentIntent ID. If Stripe rejects it, the
   * PaymentIntent is re-fetched to check whether it is *actually* already in
   * the target state (e.g. a prior request already captured it) before
   * treating the error as benign — anything else is a real failure and must
   * NOT be papered over, since the caller uses this to decide whether the
   * booking's DB state may be updated.
   */
  private async ensurePaymentIntentReachesState(
    paymentIntentId: string,
    action: (paymentIntentId: string) => Promise<Stripe.PaymentIntent>,
    targetStatus: Stripe.PaymentIntent['status'],
    actionLabel: 'capture' | 'cancel'
  ): Promise<void> {
    try {
      await action(paymentIntentId);
    } catch (err) {
      const current = await this.stripe.paymentIntents
        .retrieve(paymentIntentId)
        .catch(() => null);

      if (current?.status === targetStatus) {
        return; // Already in the desired state — safe to proceed.
      }

      throw new PaymentProviderError(
        `Stripe ${actionLabel} failed for PaymentIntent ${paymentIntentId}.`,
        err
      );
    }
  }

  private async applyWebhookEvent(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const bookingId = session.metadata?.bookingId;
        const isNewPassenger = session.metadata?.isNewPassenger === 'true';
        const tempPassword = session.metadata?.tempPassword;
        const paymentIntentId =
          typeof session.payment_intent === 'string'
            ? session.payment_intent
            : session.payment_intent?.id;

        const booking = bookingId
          ? await this.bookingRepo.findById(bookingId)
          : await this.bookingRepo.findByCheckoutSessionId(session.id);

        if (!booking) return;

        const updated = await this.bookingRepo.updatePaymentOutcome(booking.id, {
          status: 'CONFIRMED',
          paymentStatus: 'HOLD_PLACED',
          stripePaymentIntentId: paymentIntentId || booking.stripePaymentIntentId || undefined,
        });

        // Send the welcome email first for brand-new passengers, then the
        // booking confirmation, so the account credentials arrive before
        // the ride details.
        if (isNewPassenger && tempPassword) {
          await enqueueEmail('WELCOME_EMAIL', {
            passengerName: updated.fullName,
            email: updated.email,
            tempPassword,
          });
        }

        await enqueueEmail('BOOKING_CONFIRMATION_EMAIL', {
          booking: {
            confirmationNumber: updated.confirmationNumber,
            fullName: updated.fullName,
            email: updated.email,
            phone: updated.phone,
            serviceType: updated.serviceType,
            vehicleSlug: updated.vehicleSlug,
            pickupLocation: updated.pickupLocation,
            dropoffLocation: updated.dropoffLocation,
            stops: parseStops(updated.stops),
            pickupDate: updated.pickupDate,
            pickupTime: updated.pickupTime,
            passengers: updated.passengers,
            luggage: updated.luggage,
            flightNumber: updated.flightNumber,
            estimatedPrice: updated.estimatedPrice,
          },
        });

        console.log(`[PaymentService] Checkout completed for booking #${updated.confirmationNumber}`);
        break;
      }

      case 'payment_intent.amount_capturable_updated': {
        const intent = event.data.object as Stripe.PaymentIntent;
        const booking = await this.bookingRepo.findByPaymentIntentId(intent.id);
        if (!booking) return;

        await this.bookingRepo.updatePaymentOutcome(booking.id, {
          status: 'CONFIRMED',
          paymentStatus: 'HOLD_PLACED',
        });
        console.log(`[PaymentService] Hold placed for PaymentIntent: ${intent.id}`);
        break;
      }

      case 'payment_intent.succeeded': {
        const intent = event.data.object as Stripe.PaymentIntent;
        const booking = await this.bookingRepo.findByPaymentIntentId(intent.id);
        if (!booking) return;

        await this.bookingRepo.updatePaymentOutcome(booking.id, {
          status: 'COMPLETED',
          paymentStatus: 'CAPTURED',
        });
        console.log(`[PaymentService] Payment captured for PaymentIntent: ${intent.id}`);
        break;
      }

      case 'payment_intent.canceled': {
        const intent = event.data.object as Stripe.PaymentIntent;
        const booking = await this.bookingRepo.findByPaymentIntentId(intent.id);
        if (!booking) return;

        await this.bookingRepo.updatePaymentOutcome(booking.id, {
          status: 'CANCELLED',
          paymentStatus: 'CANCELLED_RELEASED',
        });
        console.log(`[PaymentService] Payment hold released for PaymentIntent: ${intent.id}`);
        break;
      }

      default:
        console.log(`[PaymentService] Unhandled Stripe event type ${event.type}`);
    }
  }
}

/** Singleton instance — import this in route handlers */
export const paymentService = new PaymentService();
