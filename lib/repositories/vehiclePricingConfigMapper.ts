/**
 * lib/repositories/vehiclePricingConfigMapper.ts
 *
 * Shared mapper: DB Vehicle → VehiclePricingConfig consumed by PricingService.
 * Centralizes vehicle-rate defaulting previously duplicated across
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
  };
}
