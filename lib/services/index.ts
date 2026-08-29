/**
 * lib/services/index.ts
 *
 * Barrel export for domain business services.
 * Pure calculations & types that are safe for both Client & Server components.
 */

// Interfaces & Types
export * from './interfaces/IDistanceService';
export * from './interfaces/IPricingService';
export * from './interfaces/IBookingService';

// Client-safe implementations & Singletons
export * from './DistanceService';
export * from './PricingService';
