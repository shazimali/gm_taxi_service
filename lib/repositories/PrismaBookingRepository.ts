/**
 * lib/repositories/PrismaBookingRepository.ts
 *
 * S — Single Responsibility: all Booking DB operations in one place.
 * D — Dependency Inversion: implements IBookingRepository.
 */

import { prisma } from '@/lib/prisma';
import type {
  IBookingRepository,
  Booking,
  BookingStatus,
  CreateBookingData,
} from './interfaces/IBookingRepository';

export class PrismaBookingRepository implements IBookingRepository {
  async findById(id: string): Promise<Booking | null> {
    const booking = await prisma.booking.findUnique({
      where: { id },
    });
    return (booking as unknown as Booking) ?? null;
  }

  async findByConfirmationNumber(confirmationNumber: string): Promise<Booking | null> {
    const booking = await prisma.booking.findUnique({
      where: { confirmationNumber },
    });
    return (booking as unknown as Booking) ?? null;
  }

  async findByCheckoutSessionId(stripeCheckoutSessionId: string): Promise<Booking | null> {
    const booking = await prisma.booking.findUnique({
      where: { stripeCheckoutSessionId },
    });
    return (booking as unknown as Booking) ?? null;
  }

  async findByPaymentIntentId(stripePaymentIntentId: string): Promise<Booking | null> {
    const booking = await prisma.booking.findUnique({
      where: { stripePaymentIntentId },
    });
    return (booking as unknown as Booking) ?? null;
  }

  async findAll(options?: {
    status?: BookingStatus;
    email?: string;
    limit?: number;
    offset?: number;
  }): Promise<Booking[]> {
    const where: Record<string, unknown> = {};
    if (options?.status) where.status = options.status;
    if (options?.email)  where.email  = options.email.toLowerCase();

    const bookings = await prisma.booking.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: options?.limit,
      skip: options?.offset,
    });
    return bookings as unknown as Booking[];
  }

  async findByPassengerId(passengerId: string): Promise<Booking[]> {
    const bookings = await prisma.booking.findMany({
      where: { passengerId },
      orderBy: { createdAt: 'desc' },
    });
    return bookings as unknown as Booking[];
  }

  async create(data: CreateBookingData): Promise<Booking> {
    const booking = await prisma.booking.create({
      data: {
        confirmationNumber: data.confirmationNumber,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        serviceType: data.serviceType,
        vehicleSlug: data.vehicleSlug ?? null,
        pickupLocation: data.pickupLocation,
        dropoffLocation: data.dropoffLocation ?? null,
        pickupDate: data.pickupDate,
        pickupTime: data.pickupTime,
        passengers: data.passengers ?? 1,
        luggage: data.luggage ?? 1,
        flightNumber: data.flightNumber ?? null,
        specialRequests: data.specialRequests ?? null,
        passengerId: data.passengerId ?? null,
        stripePaymentIntentId: data.stripePaymentIntentId ?? null,
        stripeCheckoutSessionId: data.stripeCheckoutSessionId ?? null,
        paymentStatus: data.paymentStatus ?? 'PENDING',
        estimatedPrice: data.estimatedPrice ?? null,
        fareMode: data.fareMode ?? null,
        discountApplied: data.discountApplied ?? null,
        corporateAccountId: data.corporateAccountId ?? null,
        tipPercent: data.tipPercent ?? null,
        tipAmount: data.tipAmount ?? null,
      },
    });
    return booking as unknown as Booking;
  }

  async updateStatus(id: string, status: BookingStatus): Promise<Booking> {
    const booking = await prisma.booking.update({
      where: { id },
      data: { status },
    });
    return booking as unknown as Booking;
  }

  async updatePaymentStatus(id: string, paymentStatus: string): Promise<Booking> {
    const booking = await prisma.booking.update({
      where: { id },
      data: { paymentStatus },
    });
    return booking as unknown as Booking;
  }

  async updatePaymentOutcome(
    id: string,
    data: { status: BookingStatus; paymentStatus: string; stripePaymentIntentId?: string }
  ): Promise<Booking> {
    const booking = await prisma.booking.update({
      where: { id },
      data: {
        status: data.status,
        paymentStatus: data.paymentStatus,
        ...(data.stripePaymentIntentId ? { stripePaymentIntentId: data.stripePaymentIntentId } : {}),
      },
    });
    return booking as unknown as Booking;
  }

  async delete(id: string): Promise<void> {
    await prisma.booking.delete({ where: { id } });
  }
}

/** Singleton instance — import this in route handlers & services */
export const bookingRepository = new PrismaBookingRepository();
