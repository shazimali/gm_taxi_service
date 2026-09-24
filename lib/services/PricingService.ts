/**
 * lib/services/PricingService.ts
 *
 * S — Single Responsibility: implements the fare pricing engine.
 *
 * STEP 1 — Determine the Fare
 *   1A  Hourly:  fare = rate × requested hours (no minimum)
 *   1B  Metered: estimatedMiles <= baseMiles → fare = baseFare
 *                estimatedMiles >  baseMiles → fare = baseFare + Σ (miles inside each bracket × bracket rate)
 *                Brackets are progressive (see lib/pricing/mileBrackets.ts). A vehicle with
 *                no brackets uses a single open-ended bracket at perMileRate.
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
import {
  computeTieredFare,
  validateMileBrackets,
  type MileBracket,
} from '@/lib/pricing/mileBrackets';

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

    // Use configured brackets when valid; otherwise one open bracket at perMileRate.
    const configured = vehicleConfig.mileBrackets ?? [];
    const brackets: MileBracket[] =
      configured.length > 0 && validateMileBrackets(configured, cfg.baseMiles) === null
        ? configured
        : [{ upToMiles: null, ratePerMile: cfg.perMileRate }];

    let baseFare       = 0;
    let fareMode: PriceCalculationResult['fareMode'] = 'metered';
    let fareFormula    = '';
    let fareDurationLabel = '';
    let fareBreakdown: PriceCalculationResult['fareBreakdown'];
    let meteredBaseFare: number | undefined;

    // ── STEP 1A — Hourly ────────────────────────────────────────────────────
    if (serviceType === 'hourly') {
      const billableHours = hourlyCount;
      baseFare = cfg.rateHourly * billableHours;
      fareMode = 'hourly';
      fareFormula = `$${cfg.rateHourly}/hr × ${billableHours} hr${billableHours !== 1 ? 's' : ''}`;
      fareDurationLabel = `${billableHours} hr${billableHours !== 1 ? 's' : ''}`;
    } else {
      // ── STEP 1B — Point-to-Point: Metered (base fare + tiered mile brackets) ─
      const tiered = computeTieredFare(estimatedMiles, cfg.baseFare, cfg.baseMiles, brackets);
      baseFare = tiered.total;
      fareBreakdown = tiered.breakdown;
      meteredBaseFare = cfg.baseFare;
      fareFormula =
        tiered.breakdown.length === 0
          ? `Base fare (≤ ${cfg.baseMiles} mi): $${cfg.baseFare}`
          : [
              `Base fare $${cfg.baseFare}`,
              ...tiered.breakdown.map((l) => `${l.miles} mi × $${l.rate}/mi`),
            ].join(' + ');
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
      fareBreakdown,
      meteredBaseFare,
      totalBeforeTip,
      // Legacy compat fields used by VehicleStep, ConfirmStep, etc.
      totalPrice:   totalBeforeTip.toFixed(2),
      numericTotal: totalBeforeTip,
    };
  }
}

/** Singleton instance */
export const pricingService = new PricingService();
