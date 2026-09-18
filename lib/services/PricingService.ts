/**
 * lib/services/PricingService.ts
 *
 * S — Single Responsibility: implements the fare pricing engine.
 *
 * STEP 1 — Determine the Fare
 *   1A  Hourly:  fare = rate × requested hours (no minimum)
 *   1B  Metered: estimatedMiles <= baseMiles → fare = baseFare
 *                estimatedMiles >  baseMiles → fare = estimatedMiles × perMileRate
 *                (full distance, not just the overage past baseMiles)
 *
 * STEP 2 — Tip (UI only — not computed here)
 *
 * STEP 3 — Output PriceCalculationResult
 */

import type {
  IPricingService,
  PriceCalculationParams,
  PriceCalculationResult,
} from './interfaces/IPricingService';

// ── Sensible fallback rates used when DB fields are null ─────────────────────
const FALLBACK_RATE_HOURLY = 85;
const FALLBACK_BASE_FARE = 65;
const FALLBACK_BASE_MILES = 10;
const FALLBACK_PER_MILE_RATE = 4;

// ── Main service ─────────────────────────────────────────────────────────────
export class PricingService implements IPricingService {
  calculate(params: PriceCalculationParams): PriceCalculationResult {
    const {
      serviceType,
      vehicleConfig,
      hourlyCount = 2,
      estimatedMiles = 0,
      estimatedMinutes = 0,
    } = params;

    const cfg = {
      rateHourly:   vehicleConfig.rateHourly ?? FALLBACK_RATE_HOURLY,
      baseFare:     vehicleConfig.baseFare ?? FALLBACK_BASE_FARE,
      baseMiles:    vehicleConfig.baseMiles ?? FALLBACK_BASE_MILES,
      perMileRate:  vehicleConfig.perMileRate ?? FALLBACK_PER_MILE_RATE,
    };

    let baseFare       = 0;
    let fareMode: PriceCalculationResult['fareMode'] = 'metered';
    let fareFormula    = '';
    let fareDurationLabel = '';

    // ── STEP 1A — Hourly ────────────────────────────────────────────────────
    if (serviceType === 'hourly') {
      const billableHours = hourlyCount;
      baseFare = cfg.rateHourly * billableHours;
      fareMode = 'hourly';
      fareFormula = `$${cfg.rateHourly}/hr × ${billableHours} hr${billableHours !== 1 ? 's' : ''}`;
      fareDurationLabel = `${billableHours} hr${billableHours !== 1 ? 's' : ''}`;
    } else {
      // ── STEP 1B — Point-to-Point: Metered (base-fare / per-mile threshold) ─
      if (estimatedMiles <= cfg.baseMiles) {
        baseFare = cfg.baseFare;
        fareFormula = `Base fare (≤ ${cfg.baseMiles} mi): $${cfg.baseFare}`;
      } else {
        baseFare = estimatedMiles * cfg.perMileRate;
        fareFormula = `${estimatedMiles} mi × $${cfg.perMileRate}/mi`;
      }
      fareMode = 'metered';
      fareDurationLabel = `${estimatedMiles} mi / ${estimatedMinutes} min`;
    }

    // ── STEP 2 — Tip: not computed here (UI responsibility) ─────────────────

    // ── STEP 3 — Return result ───────────────────────────────────────────────
    const totalBeforeTip = Math.round(baseFare * 100) / 100;

    return {
      baseFare:         totalBeforeTip,
      fareMode,
      fareFormula,
      formulaLabel:     fareFormula,
      fareDurationLabel,
      totalBeforeTip,
      // Legacy compat fields used by VehicleStep, ConfirmStep, etc.
      totalPrice:   totalBeforeTip.toFixed(2),
      numericTotal: totalBeforeTip,
    };
  }
}

/** Singleton instance */
export const pricingService = new PricingService();
