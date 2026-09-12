import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
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

  const paymentIntent = event.data.object as Stripe.PaymentIntent;

  try {
    switch (event.type) {
      // 🚀 0. Stripe Hosted Checkout Completed (Customer Authorized Card Hold)
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const bookingId = session.metadata?.bookingId;
        const action = session.metadata?.action;
        const isNewPassenger = session.metadata?.isNewPassenger === 'true';
        const tempPassword = session.metadata?.tempPassword;
        const paymentIntentId =
          typeof session.payment_intent === 'string'
            ? session.payment_intent
            : session.payment_intent?.id;

        const booking = await prisma.booking.findFirst({
          where: bookingId ? { id: bookingId } : { stripeCheckoutSessionId: session.id },
        });

        // 🚫 Passenger-initiated Cancel Ride checkout (cancellation fee charged) —
        // release the original pre-authorization hold and mark the booking cancelled.
        if (booking && action === 'cancel_ride') {
          if (booking.stripePaymentIntentId) {
            try {
              await stripe.paymentIntents.cancel(booking.stripePaymentIntentId);
            } catch (stripeErr: any) {
              console.warn('[Stripe Webhook] Cancel hold warning:', stripeErr?.message);
            }
          }
          await prisma.booking.update({
            where: { id: booking.id },
            data: { paymentStatus: 'CANCELLED_RELEASED', status: 'CANCELLED' },
          });
          console.log(`[Stripe Webhook] Passenger cancelled booking #${booking.confirmationNumber}`);
          break;
        }

        // ✅ Passenger-initiated Complete Ride checkout (final fare charged) —
        // release the original hold (superseded by this charge) and mark completed.
        if (booking && action === 'complete_ride') {
          if (booking.stripePaymentIntentId) {
            try {
              await stripe.paymentIntents.cancel(booking.stripePaymentIntentId);
            } catch (stripeErr: any) {
              console.warn('[Stripe Webhook] Release hold on complete warning:', stripeErr?.message);
            }
          }
          await prisma.booking.update({
            where: { id: booking.id },
            data: {
              paymentStatus: 'CAPTURED',
              status: 'COMPLETED',
              // Re-point to the new charge's PaymentIntent so the old hold's
              // upcoming `payment_intent.canceled` event (triggered by the
              // cancel() call above) no longer matches this booking and
              // can't flip it back to CANCELLED.
              stripePaymentIntentId: paymentIntentId || booking.stripePaymentIntentId,
            },
          });
          console.log(`[Stripe Webhook] Passenger completed booking #${booking.confirmationNumber}`);
          break;
        }

        if (booking) {
          await prisma.booking.update({
            where: { id: booking.id },
            data: {
              paymentStatus: 'HOLD_PLACED',
              status: 'CONFIRMED',
              stripePaymentIntentId: paymentIntentId || booking.stripePaymentIntentId,
            },
          });

          // 1. Send Booking Confirmation Email to passenger & dispatch
          const { enqueueEmail } = await import('@/lib/queue/emailQueue');
          await enqueueEmail('BOOKING_CONFIRMATION_EMAIL', {
            booking: {
              confirmationNumber: booking.confirmationNumber,
              fullName: booking.fullName,
              email: booking.email,
              phone: booking.phone,
              serviceType: booking.serviceType,
              vehicleSlug: booking.vehicleSlug,
              pickupLocation: booking.pickupLocation,
              dropoffLocation: booking.dropoffLocation,
              pickupDate: booking.pickupDate,
              pickupTime: booking.pickupTime,
              passengers: booking.passengers,
              luggage: booking.luggage,
              flightNumber: booking.flightNumber,
              estimatedPrice: booking.estimatedPrice,
            },
          });

          // 2. If new passenger auto-registered, send Welcome Email with temporary password
          if (isNewPassenger && tempPassword) {
            await enqueueEmail('WELCOME_EMAIL', {
              passengerName: booking.fullName,
              email: booking.email,
              tempPassword,
            });
          }

          console.log(`[Stripe Webhook] Checkout completed for booking #${booking.confirmationNumber}`);
        }
        break;
      }

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
