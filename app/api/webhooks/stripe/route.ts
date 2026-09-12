import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { paymentService } from '@/lib/services/PaymentService';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature') || '';

  let event: Stripe.Event;

  // ── Signature verification is MANDATORY — fail closed if misconfigured ──
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('[Stripe Webhook] STRIPE_WEBHOOK_SECRET is not set. Refusing to process.');
    return NextResponse.json({ error: 'Webhook misconfigured' }, { status: 500 });
  }
  if (!signature) {
    console.error('[Stripe Webhook] Missing stripe-signature header.');
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`[Stripe Webhook] Signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  try {
    await paymentService.handleWebhookEvent(event);
  } catch (err) {
    // A genuine processing failure (not a duplicate — handleWebhookEvent
    // short-circuits those without throwing) must surface as a 5xx so
    // Stripe retries delivery instead of silently losing the state change.
    console.error(`[Stripe Webhook] Failed to process event ${event.id} (${event.type}):`, err);
    return NextResponse.json({ error: 'Failed to process webhook event.' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
