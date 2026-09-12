/**
 * lib/repositories/interfaces/IProcessedStripeEventRepository.ts
 *
 * D — Dependency Inversion: PaymentService depends on this contract,
 *     not on Prisma, to guard webhook idempotency.
 */

export interface IProcessedStripeEventRepository {
  /** Whether a Stripe event with this ID has already been applied. */
  hasBeenProcessed(stripeEventId: string): Promise<boolean>;

  /**
   * Record an event as processed. Must be safe to call concurrently for the
   * same eventId — implementations should treat a unique-constraint
   * violation as "already recorded" rather than an error.
   */
  markProcessed(stripeEventId: string, eventType: string): Promise<void>;
}
