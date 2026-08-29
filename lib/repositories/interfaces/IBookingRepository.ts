/**
 * lib/repositories/interfaces/IBookingRepository.ts
 *
 * I — Interface Segregation: admin booking ops (list, status update)
 *     and passenger booking ops (create, own list) are on separate
 *     method groups within one interface — easy to split further if needed.
 */

export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export interface Booking {
  id: string;
  confirmationNumber: string;
  fullName: string;
  email: string;
  phone: string;
  serviceType: string;
  vehicleSlug: string | null;
  pickupLocation: string;
  dropoffLocation: string | null;
  pickupDate: string;
  pickupTime: string;
  passengers: number;
  luggage: number;
  flightNumber: string | null;
  specialRequests: string | null;
  status: BookingStatus;
  passengerId: string | null;
  stripePaymentIntentId: string | null;
  paymentStatus: string;
  estimatedPrice: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBookingData {
  confirmationNumber: string;
  fullName: string;
  email: string;
  phone: string;
  serviceType: string;
  vehicleSlug?: string | null;
  pickupLocation: string;
  dropoffLocation?: string | null;
  pickupDate: string;
  pickupTime: string;
  passengers?: number;
  luggage?: number;
  flightNumber?: string | null;
  specialRequests?: string | null;
  passengerId?: string | null;
  stripePaymentIntentId?: string | null;
  paymentStatus?: string;
  estimatedPrice?: number | null;
}

export interface IBookingRepository {
  /** Find a single booking by ID */
  findById(id: string): Promise<Booking | null>;

  /** Find a booking by confirmation number */
  findByConfirmationNumber(confirmationNumber: string): Promise<Booking | null>;

  /** List all bookings (admin) — most recent first */
  findAll(options?: { status?: BookingStatus; limit?: number; offset?: number }): Promise<Booking[]>;

  /** List all bookings belonging to a specific passenger */
  findByPassengerId(passengerId: string): Promise<Booking[]>;

  /** Create a new booking */
  create(data: CreateBookingData): Promise<Booking>;

  /** Update booking status (admin workflow) */
  updateStatus(id: string, status: BookingStatus): Promise<Booking>;

  /** Update payment status (Stripe webhook) */
  updatePaymentStatus(id: string, paymentStatus: string): Promise<Booking>;
}
