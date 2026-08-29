/**
 * lib/repositories/index.ts
 *
 * Barrel export for all repository interfaces and concrete implementations.
 * Enables clean imports throughout the app, e.g.:
 * import { adminRepository, passengerRepository, bookingRepository, vehicleRepository } from '@/lib/repositories';
 */

// Interfaces
export * from './interfaces/IAdminRepository';
export * from './interfaces/IPassengerRepository';
export * from './interfaces/IBookingRepository';
export * from './interfaces/IVehicleRepository';

// Implementations & Singletons
export * from './PrismaAdminRepository';
export * from './PrismaPassengerRepository';
export * from './PrismaBookingRepository';
export * from './PrismaVehicleRepository';
