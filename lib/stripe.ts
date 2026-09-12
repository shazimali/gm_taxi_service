import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET;

if (!stripeSecretKey) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'STRIPE_SECRET_KEY environment variable is not set. Refusing to start in production.'
    );
  }
  console.warn(
    '[lib/stripe] STRIPE_SECRET_KEY not set — using a placeholder key for local dev/build only.'
  );
}

export const stripe = new Stripe(stripeSecretKey || 'sk_test_placeholder_key_for_build_only', {
  apiVersion: '2025-01-27.acacia' as any,
  typescript: true,
});
