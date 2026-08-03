import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature') || '';

  let event: Stripe.Event;

  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (webhookSecret && signature) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      event = JSON.parse(body) as Stripe.Event;
    }
  } catch (err: any) {
    console.error(`Webhook Signature Verification Error: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  const paymentIntent = event.data.object as Stripe.PaymentIntent;

  try {
    switch (event.type) {
      // 🔒 1. Pre-Authorization Hold Successfully Placed on Card
      case 'payment_intent.amount_capturable_updated': {
        if (paymentIntent?.id) {
          await prisma.booking.updateMany({
            where: { stripePaymentIntentId: paymentIntent.id },
            data: {
              paymentStatus: 'HOLD_PLACED',
              status: 'CONFIRMED',
            },
          });
          console.log(`[Stripe Webhook] Hold placed for PaymentIntent: ${paymentIntent.id}`);
        }
        break;
      }

      // 💳 2. Payment Captured (Passenger Arrived at Destination)
      case 'payment_intent.succeeded': {
        if (paymentIntent?.id) {
          await prisma.booking.updateMany({
            where: { stripePaymentIntentId: paymentIntent.id },
            data: {
              paymentStatus: 'CAPTURED',
              status: 'COMPLETED',
            },
          });
          console.log(`[Stripe Webhook] Payment captured for PaymentIntent: ${paymentIntent.id}`);
        }
        break;
      }

      // ❌ 3. Hold Released / Cancelled
      case 'payment_intent.canceled': {
        if (paymentIntent?.id) {
          await prisma.booking.updateMany({
            where: { stripePaymentIntentId: paymentIntent.id },
            data: {
              paymentStatus: 'CANCELLED_RELEASED',
              status: 'CANCELLED',
            },
          });
          console.log(`[Stripe Webhook] Payment hold released for PaymentIntent: ${paymentIntent.id}`);
        }
        break;
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event type ${event.type}`);
    }
  } catch (dbErr) {
    console.error('[Stripe Webhook] Database update error:', dbErr);
  }

  return NextResponse.json({ received: true });
}
