'use server';

import { prisma } from '@/lib/prisma';

export interface BookingState {
  success?: boolean;
  confirmationNumber?: string;
  message?: string;
  error?: string;
}

export async function sendBookingQuote(prevState: BookingState, formData: FormData): Promise<BookingState> {
  const serviceType = formData.get('serviceType')?.toString() || 'Airport Transportation';
  const vehicleSlug = formData.get('vehicleSlug')?.toString() || 'executive-sedan';
  const pickupLocation = formData.get('pickupLocation')?.toString() || '';
  const dropoffLocation = formData.get('dropoffLocation')?.toString() || '';
  const pickupDate = formData.get('pickupDate')?.toString() || '';
  const pickupTime = formData.get('pickupTime')?.toString() || '';
  const passengers = Number(formData.get('passengers')?.toString()) || 1;
  const luggage = Number(formData.get('luggage')?.toString()) || 1;
  const flightNumber = formData.get('flightNumber')?.toString() || '';
  const fullName = formData.get('fullName')?.toString() || '';
  const email = formData.get('email')?.toString() || '';
  const phone = formData.get('phone')?.toString() || '';
  const specialRequests = formData.get('specialRequests')?.toString() || '';
  
  const stripePaymentIntentId = formData.get('stripePaymentIntentId')?.toString() || null;
  const paymentStatus = formData.get('paymentStatus')?.toString() || (stripePaymentIntentId ? 'HOLD_PLACED' : 'PENDING');
  const estimatedPrice = Number(formData.get('estimatedPrice')?.toString()) || null;

  if (!fullName || !email || !phone || !pickupLocation || !pickupDate) {
    return {
      error: 'Please fill in all required fields (Name, Email, Phone, Pickup Location & Date).',
    };
  }

  // Generate confirmation number
  const confirmationNumber = 'GML-' + Math.floor(100000 + Math.random() * 900000);

  try {
    // Find matching passenger account if exists
    const existingPassenger = await prisma.passenger.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Save to local MySQL database via Prisma
    await prisma.booking.create({
      data: {
        confirmationNumber,
        fullName,
        email: email.toLowerCase(),
        phone,
        serviceType,
        vehicleSlug,
        pickupLocation,
        dropoffLocation,
        pickupDate,
        pickupTime,
        passengers,
        luggage,
        flightNumber,
        specialRequests,
        status: 'PENDING',
        passengerId: existingPassenger?.id || null,
        stripePaymentIntentId: stripePaymentIntentId,
        paymentStatus: paymentStatus,
        estimatedPrice: estimatedPrice,
      },
    });

    return {
      success: true,
      confirmationNumber,
      message: `Your reservation request ${confirmationNumber} has been submitted! ${stripePaymentIntentId ? 'Funds pre-authorization hold placed successfully.' : 'Our dispatch desk is reviewing your trip details.'}`,
    };
  } catch (err) {
    console.error('Error saving booking to MySQL:', err);
    return {
      error: 'Failed to process booking submission. Please try again or call (617) 784-0264.',
    };
  }
}
