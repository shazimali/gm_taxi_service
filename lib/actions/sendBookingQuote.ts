'use server';

import { bookingService } from '@/lib/services/BookingService';

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

  const result = await bookingService.submitBooking({
    serviceType,
    vehicleSlug,
    pickupLocation,
    dropoffLocation,
    pickupDate,
    pickupTime,
    passengers,
    luggage,
    flightNumber,
    fullName,
    email,
    phone,
    specialRequests,
    stripePaymentIntentId,
    paymentStatus,
    estimatedPrice,
  });

  if (!result.success) {
    return { error: result.error };
  }

  return {
    success: true,
    confirmationNumber: result.confirmationNumber,
    message: result.message,
  };
}
