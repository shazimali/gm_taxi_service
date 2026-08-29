/**
 * lib/repositories/PrismaPassengerRepository.ts
 *
 * S — Single Responsibility: all Passenger + PassengerCard DB operations.
 * D — Dependency Inversion: implements IPassengerRepository &
 *     IPassengerCardRepository.
 *
 * Note on the `PrismaClient` fallback: Next.js dev server hot-reloads can
 * cause the global prisma client to lose the `passenger` model in the
 * generated types. The fallback handles this gracefully.
 */

import { PrismaClient } from '@prisma/client';
import { prisma as globalPrisma } from '@/lib/prisma';
import type {
  IPassengerRepository,
  IPassengerCardRepository,
  Passenger,
  PassengerCard,
  CreatePassengerData,
} from './interfaces/IPassengerRepository';

// Resilient client helper (handles dev hot-reload edge case)
function getClient() {
  return (globalPrisma as any)?._dmmf ? globalPrisma : new PrismaClient();
}

export class PrismaPassengerRepository implements IPassengerRepository {
  async findById(id: string): Promise<Passenger | null> {
    const client = getClient();
    return await client.passenger.findUnique({ where: { id } }) ?? null;
  }

  async findByEmail(email: string): Promise<Passenger | null> {
    const client = getClient();
    return await client.passenger.findUnique({
      where: { email: email.toLowerCase().trim() },
    }) ?? null;
  }

  async create(data: CreatePassengerData): Promise<Passenger> {
    const client = getClient();
    return await client.passenger.create({
      data: {
        fullName: data.fullName,
        email: data.email.toLowerCase().trim(),
        passwordHash: data.passwordHash,
        phone: data.phone ?? null,
        stripeCustomerId: data.stripeCustomerId ?? null,
      },
    });
  }

  async update(
    id: string,
    data: Partial<Omit<Passenger, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<Passenger> {
    const client = getClient();
    return await client.passenger.update({ where: { id }, data });
  }

  async incrementTokenVersion(id: string): Promise<void> {
    const client = getClient();
    await client.passenger.update({
      where: { id },
      data: { tokenVersion: { increment: 1 } },
    });
  }
}

export class PrismaPassengerCardRepository implements IPassengerCardRepository {
  async findByPassengerId(passengerId: string): Promise<PassengerCard[]> {
    return await globalPrisma.passengerCard.findMany({
      where: { passengerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async upsert(data: {
    passengerId: string;
    stripePaymentMethodId: string;
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
    isDefault?: boolean;
  }): Promise<PassengerCard> {
    return await globalPrisma.passengerCard.upsert({
      where: { stripePaymentMethodId: data.stripePaymentMethodId },
      update: {
        brand: data.brand,
        last4: data.last4,
        expMonth: data.expMonth,
        expYear: data.expYear,
      },
      create: {
        passengerId: data.passengerId,
        stripePaymentMethodId: data.stripePaymentMethodId,
        brand: data.brand,
        last4: data.last4,
        expMonth: data.expMonth,
        expYear: data.expYear,
        isDefault: data.isDefault ?? false,
      },
    });
  }
}

/** Singleton instances — import these in route handlers */
export const passengerRepository = new PrismaPassengerRepository();
export const passengerCardRepository = new PrismaPassengerCardRepository();
