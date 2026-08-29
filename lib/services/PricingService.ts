/**
 * lib/services/PricingService.ts
 *
 * S — Single Responsibility: calculates reservation prices based on vehicle hourly rates,
 *     service type (hourly vs distance/duration), and minimum billable increments.
 */

import type {
  IPricingService,
  PriceCalculationParams,
  PriceCalculationResult,
} from './interfaces/IPricingService';

export class PricingService implements IPricingService {
  calculate(params: PriceCalculationParams): PriceCalculationResult {
    const rate = params.rateHourly || 85;
    const isHourly = params.serviceType.toLowerCase().includes('hourly');

    if (isHourly) {
      const hours = Math.max(2, params.hourlyCount || 2);
      const total = rate * hours;
      return {
        totalPrice: total.toFixed(2),
        numericTotal: total,
        durationLabel: `${hours} Hours Requested`,
        formulaLabel: `$${rate}/hr × ${hours} hrs`,
      };
    }

    // Distance/Time based transfer
    const minutes = params.estimatedMinutes || 30;
    // Minimum 1.5 hours, rounded up to nearest 0.5 hour
    const hoursDecimal = Math.max(1.5, Math.ceil((minutes / 60) * 2) / 2);
    const total = rate * hoursDecimal;

    return {
      totalPrice: total.toFixed(2),
      numericTotal: total,
      durationLabel: `${minutes} mins (~${hoursDecimal} hrs)`,
      formulaLabel: `$${rate}/hr × ${hoursDecimal} hrs`,
    };
  }
}

/** Singleton instance */
export const pricingService = new PricingService();
