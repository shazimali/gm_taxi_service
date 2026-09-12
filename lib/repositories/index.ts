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
export * from './interfaces/ICorporateAccountRepository';
export * from './interfaces/IZoneRouteRepository';
export * from './interfaces/IProcessedStripeEventRepository';

// Implementations & Singletons
export * from './PrismaAdminRepository';
export * from './PrismaPassengerRepository';
export * from './PrismaBookingRepository';
export * from './PrismaVehicleRepository';
export * from './PrismaCorporateAccountRepository';
export * from './PrismaZoneRouteRepository';
export * from './PrismaProcessedStripeEventRepository';
