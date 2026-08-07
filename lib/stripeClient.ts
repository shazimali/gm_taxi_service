import { loadStripe } from '@stripe/stripe-js';

const publishableKey =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
  process.env.STRIPE_KEY ||
  'pk_test_placeholder_key_for_build';

export const stripePromise = loadStripe(publishableKey);
