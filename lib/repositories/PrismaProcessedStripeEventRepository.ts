/**
 * lib/repositories/PrismaProcessedStripeEventRepository.ts
 *
 * S — Single Responsibility: tracks which Stripe webhook events have
 *     already been applied, so redelivered events are safely ignored.
 * D — Dependency Inversion: implements IProcessedStripeEventRepository.
 */

import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import type { IProcessedStripeEventRepository } from './interfaces/IProcessedStripeEventRepository';

const UNIQUE_CONSTRAINT_VIOLATION = 'P2002';

export class PrismaProcessedStripeEventRepository implements IProcessedStripeEventRepository {
  async hasBeenProcessed(stripeEventId: string): Promise<boolean> {
    const existing = await prisma.processedStripeEvent.findUnique({
      where: { stripeEventId },
      select: { id: true },
    });
    return existing !== null;
  }

  async markProcessed(stripeEventId: string, eventType: string): Promise<void> {
    try {
      await prisma.processedStripeEvent.create({
        data: { stripeEventId, eventType },
      });
    } catch (err) {
      const isDuplicate =
        err instanceof Prisma.PrismaClientKnownRequestError && err.code === UNIQUE_CONSTRAINT_VIOLATION;
      if (!isDuplicate) {
        throw err;
      }
      // Another process already recorded this event — the desired end state.
    }
  }
}

/** Singleton instance — import this in route handlers & services */
export const processedStripeEventRepository = new PrismaProcessedStripeEventRepository();
