/**
 * lib/repositories/PrismaZoneRouteRepository.ts
 *
 * S — Single Responsibility: Zone route corridor DB operations.
 * D — Dependency Inversion: implements IZoneRouteRepository.
 */

import { prisma } from '@/lib/prisma';
import type {
  IZoneRouteRepository,
  ZoneRoute,
  CreateZoneRouteData,
} from './interfaces/IZoneRouteRepository';

export class PrismaZoneRouteRepository implements IZoneRouteRepository {
  async findAll(): Promise<ZoneRoute[]> {
    const routes = await prisma.zoneRoute.findMany({
      include: {
        vehicle: {
          select: { id: true, name: true, slug: true },
        },
      },
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
    });
    return routes as unknown as ZoneRoute[];
  }

  async findByVehicleId(vehicleId: string): Promise<ZoneRoute[]> {
    const routes = await prisma.zoneRoute.findMany({
      where: { vehicleId },
      orderBy: { displayOrder: 'asc' },
    });
    return routes as unknown as ZoneRoute[];
  }

  async findById(id: string): Promise<ZoneRoute | null> {
    const route = await prisma.zoneRoute.findUnique({
      where: { id },
      include: {
        vehicle: {
          select: { id: true, name: true, slug: true },
        },
      },
    });
    return (route as unknown as ZoneRoute) ?? null;
  }

  async create(data: CreateZoneRouteData): Promise<ZoneRoute> {
    const route = await prisma.zoneRoute.create({
      data: {
        vehicleId: data.vehicleId,
        name: data.name,
        pickupKeywords: data.pickupKeywords.toLowerCase().trim(),
        dropoffKeywords: data.dropoffKeywords.toLowerCase().trim(),
        flatRate: data.flatRate,
        isActive: data.isActive ?? true,
        displayOrder: data.displayOrder ?? 0,
      },
      include: {
        vehicle: {
          select: { id: true, name: true, slug: true },
        },
      },
    });
    return route as unknown as ZoneRoute;
  }

  async update(id: string, data: Partial<CreateZoneRouteData>): Promise<ZoneRoute> {
    const route = await prisma.zoneRoute.update({
      where: { id },
      data: {
        ...(data.vehicleId !== undefined && { vehicleId: data.vehicleId }),
        ...(data.name !== undefined && { name: data.name }),
        ...(data.pickupKeywords !== undefined && {
          pickupKeywords: data.pickupKeywords.toLowerCase().trim(),
        }),
        ...(data.dropoffKeywords !== undefined && {
          dropoffKeywords: data.dropoffKeywords.toLowerCase().trim(),
        }),
        ...(data.flatRate !== undefined && { flatRate: data.flatRate }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.displayOrder !== undefined && { displayOrder: data.displayOrder }),
      },
      include: {
        vehicle: {
          select: { id: true, name: true, slug: true },
        },
      },
    });
    return route as unknown as ZoneRoute;
  }

  async delete(id: string): Promise<void> {
    await prisma.zoneRoute.delete({
      where: { id },
    });
  }
}

/** Singleton instance */
export const zoneRouteRepository = new PrismaZoneRouteRepository();
