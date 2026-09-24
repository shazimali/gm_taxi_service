import React from 'react';
import Link from 'next/link';
import { CheckCircle2, ShieldCheck, Calendar, MapPin, Car, Phone, Mail, ArrowRight, UserCheck } from 'lucide-react';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { enqueueEmail } from '@/lib/queue/emailQueue';
import { issueWelcomePassword } from '@/lib/auth/welcomePassword';
import { parseStops } from '@/lib/utils/stops';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Reservation Confirmed | GM Limo Services Boston',
  description: 'Your luxury chauffeur reservation has been received and card pre-authorization hold secured.',
};

interface ThankYouPageProps {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function ThankYouPage({ searchParams }: ThankYouPageProps) {
  const resolvedSearchParams = await searchParams;
  const sessionId = resolvedSearchParams.session_id;

  let booking: any = null;
  let isNewPassenger = false;
  let sessionStatus = 'complete';

  if (sessionId) {
    try {
      // 1. Retrieve Stripe session
      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['payment_intent'],
      });

      const bookingId = session.metadata?.bookingId;
      isNewPassenger = session.metadata?.isNewPassenger === 'true';
      const placeholderPasswordHash = session.metadata?.placeholderPasswordHash;
      const paymentIntent = typeof session.payment_intent === 'string' ? null : session.payment_intent;
      const paymentIntentId =
        typeof session.payment_intent === 'string' ? session.payment_intent : paymentIntent?.id;
      // Only a completed session whose card hold actually went through may
      // confirm the booking — otherwise anyone opening this URL for an
      // abandoned checkout would confirm an unpaid ride.
      const holdAuthorized =
        session.status === 'complete' &&
        (paymentIntent?.status === 'requires_capture' || paymentIntent?.status === 'succeeded');

      // 2. Find booking
      booking = await prisma.booking.findFirst({
        where: bookingId ? { id: bookingId } : { stripeCheckoutSessionId: sessionId },
      });

      // 3. Ensure booking is marked confirmed & hold placed (self-healing if webhook hasn't fired yet)
      if (booking && holdAuthorized && booking.paymentStatus !== 'HOLD_PLACED') {
        booking = await prisma.booking.update({
          where: { id: booking.id },
          data: {
            paymentStatus: 'HOLD_PLACED',
            status: 'CONFIRMED',
            stripePaymentIntentId: paymentIntentId || booking.stripePaymentIntentId,
          },
        });

        // Send the welcome email first for brand-new passengers, then the
        // booking confirmation, so the account credentials arrive before
        // the ride details.
        const tempPassword =
          isNewPassenger && placeholderPasswordHash && booking.passengerId
            ? await issueWelcomePassword(booking.passengerId, placeholderPasswordHash)
            : null;
        if (tempPassword) {
          await enqueueEmail('WELCOME_EMAIL', {
            passengerName: booking.fullName,
            email: booking.email,
            tempPassword,
          });
        }

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
            stops: parseStops(booking.stops),
            pickupDate: booking.pickupDate,
            pickupTime: booking.pickupTime,
            passengers: booking.passengers,
            luggage: booking.luggage,
            flightNumber: booking.flightNumber,
            estimatedPrice: booking.estimatedPrice,
          },
        });
      }
    } catch (err: any) {
      console.error('[ThankYouPage] Stripe session retrieval error:', err?.message);
    }
  }

  const phoneDisplay = '(617) 784-0264';

  return (
    <div
      style={{
        minHeight: '80vh',
        backgroundColor: '#09090b',
        color: '#f4f4f5',
        padding: '3rem 1rem 5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '720px',
          backgroundColor: '#18181b',
          border: '1px solid rgba(197, 164, 109, 0.4)',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 40px rgba(191, 160, 84, 0.1)',
          overflow: 'hidden',
        }}
      >
        {/* Header Ribbon */}
        <div
          style={{
            background: 'linear-gradient(135deg, #bfa054 0%, #997b32 100%)',
            padding: '1.75rem 2rem',
            textAlign: 'center',
            color: '#09090b',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#09090b',
              color: '#bfa054',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.75rem',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            }}
          >
            <CheckCircle2 size={36} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, margin: '0 0 0.35rem 0', letterSpacing: '-0.02em' }}>
            Reservation Pre-Authorized!
          </h1>
          <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, opacity: 0.9 }}>
            Your card hold has been secured. Your vehicle &amp; chauffeur are assigned.
          </p>
        </div>

        {/* Content Body */}
        <div style={{ padding: '2rem 2.25rem' }}>
          {/* Confirmation Number Badge */}
          {booking && (
            <div
              style={{
                backgroundColor: '#27272a',
                border: '1px dashed #bfa054',
                borderRadius: '12px',
                padding: '1rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.75rem',
                flexWrap: 'wrap',
                gap: '0.75rem',
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: '#a1a1aa',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    display: 'block',
                  }}
                >
                  Confirmation Number
                </span>
                <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#f4f4f5', fontFamily: 'monospace' }}>
                  #{booking.confirmationNumber}
                </span>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: '#a1a1aa',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    display: 'block',
                  }}
                >
                  Pre-Authorized Hold
                </span>
                <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#bfa054' }}>
                  ${booking.estimatedPrice ? Number(booking.estimatedPrice).toFixed(2) : '0.00'}
                </span>
              </div>
            </div>
          )}

          {/* Auto-Account Notification if New Passenger */}
          {isNewPassenger && (
            <div
              style={{
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                borderRadius: '12px',
                padding: '1.15rem 1.25rem',
                marginBottom: '1.75rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.85rem',
              }}
            >
              <UserCheck size={22} color="#4ade80" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '0.875rem', lineHeight: 1.5 }}>
                <strong style={{ color: '#4ade80', display: 'block', fontSize: '0.95rem', marginBottom: '0.2rem' }}>
                  🔑 Passenger Account Created!
                </strong>
                We have registered your account with <strong>{booking?.email}</strong>. Your temporary password and login credentials have been sent to your email. You are currently logged in.
              </div>
            </div>
          )}

          {/* Booking Summary Card */}
          {booking ? (
            <div
              style={{
                backgroundColor: '#27272a',
                borderRadius: '14px',
                border: '1px solid #3f3f46',
                padding: '1.5rem',
                marginBottom: '1.75rem',
              }}
            >
              <h3
                style={{
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  color: '#bfa054',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  margin: '0 0 1rem 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <Car size={18} />
                <span>Reservation Itinerary</span>
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <Calendar size={16} color="#bfa054" style={{ flexShrink: 0, marginTop: '3px' }} />
                  <div>
                    <span style={{ color: '#a1a1aa', fontSize: '0.75rem', display: 'block' }}>Date &amp; Time</span>
                    <strong style={{ color: '#ffffff' }}>
                      {booking.pickupDate} at {booking.pickupTime}
                    </strong>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <MapPin size={16} color="#4ade80" style={{ flexShrink: 0, marginTop: '3px' }} />
                  <div>
                    <span style={{ color: '#a1a1aa', fontSize: '0.75rem', display: 'block' }}>Pickup Location</span>
                    <span style={{ color: '#ffffff' }}>{booking.pickupLocation}</span>
                  </div>
                </div>

                {parseStops(booking.stops).length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <MapPin size={16} color="#60a5fa" style={{ flexShrink: 0, marginTop: '3px' }} />
                    <div>
                      <span style={{ color: '#a1a1aa', fontSize: '0.75rem', display: 'block' }}>Stops</span>
                      <span style={{ color: '#ffffff' }}>
                        {parseStops(booking.stops).map((s, i) => `${i + 1}. ${s}`).join('  ')}
                      </span>
                    </div>
                  </div>
                )}

                {booking.dropoffLocation && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <MapPin size={16} color="#f87171" style={{ flexShrink: 0, marginTop: '3px' }} />
                    <div>
                      <span style={{ color: '#a1a1aa', fontSize: '0.75rem', display: 'block' }}>Drop-off Location</span>
                      <span style={{ color: '#ffffff' }}>{booking.dropoffLocation}</span>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <Car size={16} color="#bfa054" style={{ flexShrink: 0, marginTop: '3px' }} />
                  <div>
                    <span style={{ color: '#a1a1aa', fontSize: '0.75rem', display: 'block' }}>Service &amp; Vehicle</span>
                    <span style={{ color: '#ffffff' }}>
                      {booking.serviceType} •{' '}
                      <span style={{ textTransform: 'capitalize' }}>
                        {booking.vehicleSlug?.replace(/-/g, ' ') || 'Executive Vehicle'}
                      </span>
                    </span>
                  </div>
                </div>

                {booking.flightNumber && (
                  <div style={{ color: '#a1a1aa', fontSize: '0.8rem', paddingLeft: '1.75rem' }}>
                    Flight Tail #: <strong style={{ color: '#ffffff' }}>{booking.flightNumber}</strong>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '1.5rem 0', color: '#a1a1aa' }}>
              <p>Your payment hold was placed successfully! Confirmation details have been sent to your email.</p>
            </div>
          )}

          {/* Security & Hold Notice */}
          <div
            style={{
              backgroundColor: '#1f1f23',
              border: '1px solid #3f3f46',
              borderRadius: '10px',
              padding: '1rem',
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
            }}
          >
            <ShieldCheck size={20} color="#bfa054" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.8rem', color: '#a1a1aa', lineHeight: 1.5 }}>
              <strong style={{ color: '#ffffff' }}>Card Authorization Hold Policy:</strong> A temporary pre-authorization hold is active on your payment card. No funds are permanently deducted until your ride has been completed by your chauffeur.
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            <Link
              href="/dashboard"
              style={{
                flex: '1 1 220px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                backgroundColor: '#bfa054',
                color: '#09090b',
                padding: '0.85rem 1.5rem',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '0.925rem',
                textDecoration: 'none',
                transition: 'opacity 0.2s',
              }}
            >
              <span>Go to Passenger Dashboard</span>
              <ArrowRight size={16} />
            </Link>

            <Link
              href="/book"
              style={{
                flex: '1 1 180px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                padding: '0.85rem 1.5rem',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.925rem',
                textDecoration: 'none',
              }}
            >
              Book Another Ride
            </Link>
          </div>

          {/* Support Helpline */}
          <div
            style={{
              marginTop: '2rem',
              textAlign: 'center',
              fontSize: '0.8rem',
              color: '#71717a',
              borderTop: '1px solid #27272a',
              paddingTop: '1.25rem',
            }}
          >
            Need to adjust pickup time or flight information? Call 24/7 Dispatch at{' '}
            <a href={`tel:16177840264`} style={{ color: '#bfa054', fontWeight: 700, textDecoration: 'none' }}>
              {phoneDisplay}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
