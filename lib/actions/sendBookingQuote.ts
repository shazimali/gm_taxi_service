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

  if (!fullName || !email || !phone || !pickupLocation || !pickupDate) {
    return {
      error: 'Please fill in all required fields (Name, Email, Phone, Pickup Location & Date).',
    };
  }

  // Generate confirmation number
  const confirmationNumber = 'GML-' + Math.floor(100000 + Math.random() * 900000);

  try {
    // Save to local MySQL database via Prisma
    await prisma.booking.create({
      data: {
        confirmationNumber,
        fullName,
        email,
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
      },
    });

    return {
      success: true,
      confirmationNumber,
      message: `Your reservation request ${confirmationNumber} has been saved to the database! Our 24/7 dispatch desk is reviewing your route and will email your rate confirmation shortly.`,
    };
  } catch (err) {
    console.error('Error saving booking to MySQL:', err);
    return {
      error: 'Failed to process booking submission. Please try again or call (617) 784-0264.',
    };
  }
}
