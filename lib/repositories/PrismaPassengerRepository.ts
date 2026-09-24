/**
 * lib/repositories/PrismaPassengerRepository.ts
 *
 * S — Single Responsibility: all Passenger DB operations.
 * D — Dependency Inversion: implements IPassengerRepository.
 *
 * Note on the `PrismaClient` fallback: Next.js dev server hot-reloads can
 * cause the global prisma client to lose the `passenger` model in the
 * generated types. The fallback handles this gracefully.
 */

import { PrismaClient } from '@prisma/client';
import { prisma as globalPrisma } from '@/lib/prisma';
import type {
  IPassengerRepository,
  Passenger,
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

  async setResetToken(id: string, tokenHash: string, expiresAt: Date): Promise<void> {
    const client = getClient();
    await client.passenger.update({
      where: { id },
      data: { resetTokenHash: tokenHash, resetTokenExpiresAt: expiresAt },
    });
  }

  async findByResetToken(tokenHash: string): Promise<Passenger | null> {
    const client = getClient();
    return await client.passenger.findFirst({
      where: { resetTokenHash: tokenHash, resetTokenExpiresAt: { gt: new Date() } },
    }) ?? null;
  }

  async resetPassword(id: string, passwordHash: string): Promise<void> {
    const client = getClient();
    await client.passenger.update({
      where: { id },
      data: {
        passwordHash,
        tokenVersion: { increment: 1 },
        resetTokenHash: null,
        resetTokenExpiresAt: null,
      },
    });
  }

  async replacePasswordIfUnchanged(id: string, expectedHash: string, newHash: string): Promise<boolean> {
    const client = getClient();
    const { count } = await client.passenger.updateMany({
      where: { id, passwordHash: expectedHash },
      data: { passwordHash: newHash },
    });
    return count === 1;
  }
}

/** Singleton instance — import this in route handlers */
export const passengerRepository = new PrismaPassengerRepository();
