/**
 * lib/repositories/vehiclePricingConfigMapper.ts
 *
 * Shared mapper: DB Vehicle (with zoneRoutes relation) →
 * VehiclePricingConfig consumed by PricingService. Centralizes the
 * comma-string keyword parsing that was previously duplicated across
 * /api/quote, /api/create-payment-intent, and /api/checkout-session.
 */

import type { Vehicle } from './interfaces/IVehicleRepository';
import type { VehiclePricingConfig } from '@/lib/services/interfaces/IPricingService';

export function toVehiclePricingConfig(vehicle: Vehicle | null): VehiclePricingConfig {
  return {
    rateHourly: vehicle?.rateHourly ?? 85,
    baseFare: vehicle?.baseFare ?? null,
    baseMiles: vehicle?.baseMiles ?? null,
    perMileRate: vehicle?.perMileRate ?? null,
    zoneRoutes: (vehicle?.zoneRoutes ?? []).map((zr) => ({
      id: zr.id,
      name: zr.name,
      pickupKeywords: zr.pickupKeywords
        .split(',')
        .map((k) => k.trim().toLowerCase())
        .filter(Boolean),
      dropoffKeywords: zr.dropoffKeywords
        .split(',')
        .map((k) => k.trim().toLowerCase())
        .filter(Boolean),
      flatRate: zr.flatRate,
    })),
  };
}
