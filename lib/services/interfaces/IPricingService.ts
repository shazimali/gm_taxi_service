/**
 * lib/services/interfaces/IPricingService.ts
 *
 * S — Single Responsibility: Price calculation logic for hourly and point-to-point transfers.
 */

export interface PriceCalculationParams {
  rateHourly: number;
  serviceType: string;
  estimatedMinutes?: number;
  hourlyCount?: number;
}

export interface PriceCalculationResult {
  totalPrice: string;
  numericTotal: number;
  durationLabel: string;
  formulaLabel: string;
}

export interface IPricingService {
  calculate(params: PriceCalculationParams): PriceCalculationResult;
}
