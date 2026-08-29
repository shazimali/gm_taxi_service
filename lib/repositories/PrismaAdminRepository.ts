/**
 * lib/repositories/PrismaAdminRepository.ts
 *
 * S — Single Responsibility: all Admin DB operations in one place.
 * D — Dependency Inversion: implements IAdminRepository, so callers
 *     never import Prisma types directly.
 * O — Open/Closed: to add caching (e.g. Redis), extend this class or
 *     wrap it in a CachedAdminRepository — no existing code changes.
 */

import { prisma } from '@/lib/prisma';
import type { IAdminRepository, Admin } from './interfaces/IAdminRepository';

export class PrismaAdminRepository implements IAdminRepository {
  async findById(id: string): Promise<Admin | null> {
    const admin = await prisma.admin.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, tokenVersion: true, createdAt: true },
    });
    return admin ?? null;
  }

  async findByEmail(email: string): Promise<(Admin & { password: string }) | null> {
    const admin = await prisma.admin.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    return admin ?? null;
  }

  async incrementTokenVersion(id: string): Promise<void> {
    await prisma.admin.update({
      where: { id },
      data: { tokenVersion: { increment: 1 } },
    });
  }
}

/** Singleton instance — import this in route handlers */
export const adminRepository = new PrismaAdminRepository();
