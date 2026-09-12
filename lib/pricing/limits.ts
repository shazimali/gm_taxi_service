/**
 * lib/pricing/limits.ts
 *
 * Single source of truth for the payment amount bounds enforced by every
 * route that creates a Stripe charge/hold (create-payment-intent, checkout-session).
 * Previously these two routes each hardcoded their own, inconsistent numbers.
 */

export const MIN_AMOUNT_USD = 5;
export const MAX_AMOUNT_USD = 10_000;
