/**
 * lib/repositories/PrismaVehicleRepository.ts
 *
 * S — Single Responsibility: all Vehicle DB operations in one place.
 * D — Dependency Inversion: implements IVehicleRepository.
 */

import { prisma } from '@/lib/prisma';
import type {
  IVehicleRepository,
  Vehicle,
  CreateVehicleData,
} from './interfaces/IVehicleRepository';

export class PrismaVehicleRepository implements IVehicleRepository {
  async findAll(): Promise<Vehicle[]> {
    const vehicles = await prisma.vehicle.findMany({
      orderBy: { displayOrder: 'asc' },
    });
    return vehicles as unknown as Vehicle[];
  }

  async findBySlug(slug: string): Promise<Vehicle | null> {
    const vehicle = await prisma.vehicle.findUnique({
      where: { slug },
    });
    return (vehicle as unknown as Vehicle) ?? null;
  }

  async findById(id: string): Promise<Vehicle | null> {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
    });
    return (vehicle as unknown as Vehicle) ?? null;
  }

  async create(data: CreateVehicleData): Promise<Vehicle> {
    const vehicle = await prisma.vehicle.create({
      data: {
        slug: data.slug,
        name: data.name,
        category: data.category ?? 'Executive',
        model: data.model ?? '',
        passengerCapacity: data.passengerCapacity ?? 4,
        luggageCapacity: data.luggageCapacity ?? 3,
        rateHourly: data.rateHourly ?? null,
        description: data.description ?? null,
        image: data.image ?? null,
        features: data.features ?? null,
        displayOrder: data.displayOrder ?? 0,
      },
    });
    return vehicle as unknown as Vehicle;
  }

  async update(id: string, data: Partial<CreateVehicleData>): Promise<Vehicle> {
    const vehicle = await prisma.vehicle.update({
      where: { id },
      data,
    });
    return vehicle as unknown as Vehicle;
  }

  async delete(id: string): Promise<void> {
    await prisma.vehicle.delete({
      where: { id },
    });
  }
}

/** Singleton instance — import this in route handlers & services */
export const vehicleRepository = new PrismaVehicleRepository();
