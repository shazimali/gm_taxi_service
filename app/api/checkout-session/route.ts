import { NextResponse } from 'next/server';
import { randomInt } from 'crypto';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { signPassengerToken } from '@/lib/auth';
import { createPlaceholderPasswordHash } from '@/lib/auth/welcomePassword';
import { vehicleRepository } from '@/lib/repositories';
import { pricingService } from '@/lib/services';
import { toVehiclePricingConfig } from '@/lib/repositories/vehiclePricingConfigMapper';
import { MIN_AMOUNT_USD, MAX_AMOUNT_USD } from '@/lib/pricing/limits';
import { checkoutSessionSchema } from '@/lib/validation/bookingSchemas';
import { readJsonBody, validationErrorResponse } from '@/lib/api/errorResponse';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

function normalizeServiceType(st?: string): 'hourly' | 'point-to-point' {
  if (!st) return 'point-to-point';
  const lower = st.toLowerCase();
  if (lower.includes('hour')) return 'hourly';
  return 'point-to-point';
}

export async function POST(req: Request) {
  try {
    // Anonymous endpoint that creates a passenger, Stripe customer and booking
    // per call — cap it so it can't be used to spam accounts or bookings.
    const ip = getClientIp(req);
    const limitResult = await rateLimit(`checkout_session_${ip}`, 10, 15 * 60 * 1000);
    if (!limitResult.success) {
      return NextResponse.json(
        { error: 'Too many booking attempts. Please try again in a few minutes.' },
        { status: 429, headers: { 'Retry-After': '900' } }
      );
    }

    const parsed = checkoutSessionSchema.safeParse(await readJsonBody(req));
    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }
    const {
      fullName,
      email,
      phone,
      serviceType,
      vehicleSlug = 'executive-sedan',
      pickupLocation,
      dropoffLocation,
      stops,
      pickupDate,
      pickupTime,
      passengers = 1,
      luggage = 1,
      flightNumber,
      specialRequests,
      estimatedMinutes,
      estimatedMiles,
      hourlyCount,
      tipPercent,
      tipAmount = 0,
    } = parsed.data;

    const cleanEmail = email.toLowerCase().trim();
    const cleanPhone = phone ? phone.trim() : null;
    const cleanStops: string[] = Array.isArray(stops)
      ? stops.filter((s: unknown): s is string => typeof s === 'string' && s.trim().length >= 3).map((s) => s.trim())
      : [];

    // 2. Fetch vehicle & build pricing config (Server-Side Price Validation)
    const targetSlug = vehicleSlug || 'executive-sedan';
    const vehicle = await vehicleRepository.findBySlug(targetSlug);

    const vehicleConfig = toVehiclePricingConfig(vehicle);

    const parsedMinutes = Number(estimatedMinutes);
    const parsedMiles = Number(estimatedMiles);
    const parsedHours = Number(hourlyCount);

    const priceCalc = pricingService.calculate({
      serviceType: normalizeServiceType(serviceType),
      vehicleConfig,
      estimatedMinutes: !isNaN(parsedMinutes) && parsedMinutes > 0 ? parsedMinutes : 0,
      estimatedMiles: !isNaN(parsedMiles) && parsedMiles > 0 ? parsedMiles : 0,
      hourlyCount: !isNaN(parsedHours) && parsedHours > 0 ? parsedHours : 2,
    });

    const parsedTip = Number(tipAmount) > 0 ? Number(tipAmount) : 0;
    const finalTotal = Math.round((priceCalc.totalBeforeTip + parsedTip) * 100) / 100;

    if (finalTotal < MIN_AMOUNT_USD || finalTotal > MAX_AMOUNT_USD) {
      return NextResponse.json(
        { error: `Calculated total ($${finalTotal}) is outside allowed limits.` },
        { status: 400 }
      );
    }

    // 4. Auto-register or find passenger account
    let passenger = await prisma.passenger.findUnique({
      where: { email: cleanEmail },
    });

    let isNewPassenger = false;
    // The real temporary password is only issued (and emailed) after payment
    // succeeds — see lib/auth/welcomePassword.ts. Until then the account
    // holds an unusable placeholder hash.
    let placeholderPasswordHash = '';

    if (!passenger) {
      isNewPassenger = true;
      placeholderPasswordHash = await createPlaceholderPasswordHash();
      const passwordHash = placeholderPasswordHash;

      // Create Stripe Customer
      let stripeCustomerId: string | null = null;
      const stripeKey = process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET;
      if (stripeKey && stripeKey.startsWith('sk_')) {
        try {
          const customer = await stripe.customers.create({
            email: cleanEmail,
            name: fullName,
            phone: cleanPhone || undefined,
          });
          stripeCustomerId = customer.id;
        } catch (stripeErr: any) {
          console.warn('Stripe customer creation warning:', stripeErr?.message);
        }
      }

      passenger = await prisma.passenger.create({
        data: {
          fullName: fullName.trim(),
          email: cleanEmail,
          passwordHash,
          phone: cleanPhone,
          stripeCustomerId,
        },
      });
    } else {
      // Update phone or name if provided and missing
      if (cleanPhone && !passenger.phone) {
        passenger = await prisma.passenger.update({
          where: { id: passenger.id },
          data: { phone: cleanPhone },
        });
      }
    }

    // 5. Generate confirmation number & create pending Booking
    const confirmationNumber = 'GML-' + randomInt(100000, 1000000);
    const serviceLabel = serviceType.includes('Hourly')
      ? `${serviceType} (${hourlyCount || 2} Hours)`
      : serviceType;

    const booking = await prisma.booking.create({
      data: {
        confirmationNumber,
        fullName: fullName.trim(),
        email: cleanEmail,
        phone: cleanPhone || passenger.phone || '',
        serviceType: serviceLabel,
        vehicleSlug: targetSlug,
        pickupLocation: pickupLocation.trim(),
        dropoffLocation: dropoffLocation?.trim() || null,
        stops: cleanStops.length > 0 ? JSON.stringify(cleanStops) : null,
        pickupDate: pickupDate.trim(),
        pickupTime: pickupTime.trim(),
        passengers: Number(passengers) || 1,
        luggage: Number(luggage) || 1,
        flightNumber: flightNumber?.trim() || null,
        specialRequests: specialRequests?.trim() || null,
        passengerId: passenger.id,
        paymentStatus: 'CHECKOUT_PENDING',
        status: 'PENDING',
        estimatedPrice: finalTotal,
        fareMode: priceCalc.fareMode,
        tipPercent: tipPercent !== undefined && tipPercent !== null ? Number(tipPercent) : null,
        tipAmount: parsedTip,
      },
    });

    // 6. Build Stripe Checkout Session
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const origin = req.headers.get('origin') || (host ? `${protocol}://${host}` : 'http://localhost:3000');

    const lineItems: any[] = [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${serviceLabel} — ${vehicle?.name || 'Executive Fleet'}`,
            description: `Pickup: ${pickupLocation} | Date: ${pickupDate} at ${pickupTime}${
              cleanStops.length > 0 ? ` | Stops: ${cleanStops.join(' -> ')}` : ''
            }${dropoffLocation ? ` | Dropoff: ${dropoffLocation}` : ''}`,
          },
          unit_amount: Math.round(priceCalc.totalBeforeTip * 100),
        },
        quantity: 1,
      },
    ];

    if (parsedTip > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Chauffeur Gratuity (Driver Tip)',
            description: '100% directly allocated to your dedicated professional chauffeur',
          },
          unit_amount: Math.round(parsedTip * 100),
        },
        quantity: 1,
      });
    }

    const passengerId = passenger.id;

    // Stripe fetches the logo itself, so it must be a public HTTPS URL. On
    // localhost (http) fall back to the logo already served by the live site.
    const publicOrigin = (process.env.APP_URL || origin).replace(/\/+$/, '');
    const logoUrl =
      process.env.STRIPE_LOGO_URL ||
      (publicOrigin.startsWith('https://')
        ? `${publicOrigin}/images/stripe-logo.png`
        : 'https://gmlimoservices.com/images/logo.png');
    // A logo uploaded to Stripe (Files API, purpose=business_logo) wins, since it
    // doesn't depend on the site being publicly reachable.
    const logoFileId = process.env.STRIPE_LOGO_FILE_ID;
    const brandingSettings = {
      display_name: 'GM Limo Services',
      logo: logoFileId
        ? { type: 'file' as const, file: logoFileId }
        : { type: 'url' as const, url: logoUrl },
    };

    function buildSessionParams(customerId: string | null) {
      return {
        mode: 'payment' as const,
        branding_settings: brandingSettings,
        payment_intent_data: {
          capture_method: 'manual' as const, // 🔒 Places pre-authorization hold on card!
          metadata: {
            bookingId: booking.id,
            confirmationNumber: booking.confirmationNumber,
            passengerId,
          },
        },
        customer: customerId || undefined,
        customer_email: customerId ? undefined : cleanEmail,
        line_items: lineItems,
        success_url: `${origin}/book/thank-you?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/book?cancelled=1`,
        metadata: {
          bookingId: booking.id,
          confirmationNumber: booking.confirmationNumber,
          passengerId,
          isNewPassenger: isNewPassenger ? 'true' : 'false',
          placeholderPasswordHash,
        },
      };
    }

    let session;
    try {
      session = await stripe.checkout.sessions.create(buildSessionParams(passenger.stripeCustomerId));
    } catch (stripeErr: any) {
      // The stored Stripe customer ID doesn't exist in this Stripe account/mode
      // (e.g. left over from a different environment or key) — clear it and
      // retry as a guest checkout via email instead of failing the booking.
      if (stripeErr?.code === 'resource_missing' && stripeErr?.param === 'customer') {
        console.warn(
          `[CheckoutSession] Stale Stripe customer ${passenger.stripeCustomerId} for passenger ${passenger.id} — retrying without it.`
        );
        await prisma.passenger.update({
          where: { id: passenger.id },
          data: { stripeCustomerId: null },
        });
        session = await stripe.checkout.sessions.create(buildSessionParams(null));
      } else {
        throw stripeErr;
      }
    }

    // 7. Update booking with Stripe Checkout session ID
    try {
      await prisma.booking.update({
        where: { id: booking.id },
        data: { stripeCheckoutSessionId: session.id },
      });
    } catch (updateErr: any) {
      console.warn('[CheckoutSession] Falling back to direct SQL update for stripeCheckoutSessionId:', updateErr?.message);
      await prisma.$executeRawUnsafe(
        'UPDATE bookings SET stripeCheckoutSessionId = ? WHERE id = ?',
        session.id,
        booking.id
      );
    }

    const response = NextResponse.json({
      success: true,
      checkoutUrl: session.url,
      confirmationNumber: booking.confirmationNumber,
      bookingId: booking.id,
    });

    // 8. Log in only a passenger account created by this request. An existing
    // account is never logged in from checkout — anyone can type its email
    // here, so that would hand over the account. Returning customers log in
    // with their password to see the booking.
    if (isNewPassenger) {
      const token = await signPassengerToken({
        passengerId: passenger.id,
        email: passenger.email,
        fullName: passenger.fullName,
        tokenVersion: passenger.tokenVersion || 1,
      });

      response.cookies.set('passenger_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60,
        path: '/',
      });
    }

    return response;
  } catch (err: any) {
    console.error('[/api/checkout-session] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to initialize Stripe checkout session.' },
      { status: 500 }
    );
  }
}
