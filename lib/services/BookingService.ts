/**
 * lib/services/BookingService.ts
 *
 * S — Single Responsibility: Coordinates booking persistence, passenger lookup,
 *     confirmation generation, and email queuing.
 * D — Dependency Inversion: Depends on IBookingRepository and IPassengerRepository interfaces.
 */

import {
  bookingRepository,
  passengerRepository,
  type IBookingRepository,
  type IPassengerRepository,
} from '@/lib/repositories';
import { enqueueEmail } from '@/lib/queue/emailQueue';
import type {
  IBookingService,
  SubmitBookingInput,
  SubmitBookingResult,
} from './interfaces/IBookingService';

export class BookingService implements IBookingService {
  private readonly bookingRepo: IBookingRepository;
  private readonly passengerRepo: IPassengerRepository;

  constructor(
    bookingRepo: IBookingRepository = bookingRepository,
    passengerRepo: IPassengerRepository = passengerRepository
  ) {
    this.bookingRepo = bookingRepo;
    this.passengerRepo = passengerRepo;
  }

  private generateConfirmationNumber(): string {
    return 'GML-' + Math.floor(100000 + Math.random() * 900000);
  }

  async submitBooking(input: SubmitBookingInput): Promise<SubmitBookingResult> {
    if (!input.fullName || !input.email || !input.phone || !input.pickupLocation || !input.pickupDate) {
      return {
        success: false,
        error: 'Please fill in all required fields (Name, Email, Phone, Pickup Location & Date).',
      };
    }

    const confirmationNumber = this.generateConfirmationNumber();
    const cleanEmail = input.email.toLowerCase().trim();

    try {
      // 1. Link to existing passenger if available
      let passengerId = input.passengerId || null;
      if (!passengerId) {
        const existingPassenger = await this.passengerRepo.findByEmail(cleanEmail);
        if (existingPassenger) {
          passengerId = existingPassenger.id;
        }
      }

      // 2. Persist booking via repository
      const booking = await this.bookingRepo.create({
        ...input,
        email: cleanEmail,
        confirmationNumber,
        passengerId,
        paymentStatus: input.paymentStatus || (input.stripePaymentIntentId ? 'HOLD_PLACED' : 'PENDING'),
      });

      // 3. Enqueue confirmation email asynchronously
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

      const message = `Your reservation request ${confirmationNumber} has been submitted! ${
        input.stripePaymentIntentId
          ? 'Funds pre-authorization hold placed successfully.'
          : 'Our dispatch desk is reviewing your trip details.'
      }`;

      return {
        success: true,
        confirmationNumber,
        booking,
        message,
      };
    } catch (err: any) {
      console.error('BookingService Error:', err);
      return {
        success: false,
        error: 'Failed to process booking submission. Please try again or call (617) 784-0264.',
      };
    }
  }
}

/** Singleton instance */
export const bookingService = new BookingService();
