/**
 * lib/services/PricingService.ts
 *
 * S — Single Responsibility: implements the 4-step pricing engine.
 *
 * STEP 1 — Determine the Fare
 *   1A  Hourly:     billableHours = max(minHours, requested); fare = rate × hours
 *   1B  Zone Flat:  pickup+dropoff match a ZoneRoute → fare = flatRate (nothing added)
 *   1C  Metered:    fare = baseFee + (miles × ratePerMile) + (mins × ratePerMinute)
 *                   fare = max(fare, minimumTripFee)
 *
 * STEP 2 — Corporate Discount
 *   discount = baseFare × (discountPct / 100)
 *   fareAfterDiscount = baseFare − discount
 *   (Discount applied to Step 1 fare ONLY — not applied to tip)
 *
 * STEP 3 — Tip (UI only — not computed here)
 *
 * STEP 4 — Output PriceCalculationResult
 */

import type {
  IPricingService,
  PriceCalculationParams,
  PriceCalculationResult,
  ZoneRouteConfig,
} from './interfaces/IPricingService';

// ── Sensible fallback rates used when DB fields are null ─────────────────────
const FALLBACK_RATE_HOURLY   = 85;
const FALLBACK_MIN_HOURS     = 2;
const FALLBACK_RATE_PER_MILE = 3.5;
const FALLBACK_RATE_PER_MIN  = 0.65;
const FALLBACK_BASE_FEE      = 15;
const FALLBACK_MIN_TRIP_FEE  = 65;

// ── Zone matching helper ──────────────────────────────────────────────────────
function matchesKeywords(address: string, keywords: string[]): boolean {
  const lower = address.toLowerCase();
  return keywords.some((kw) => kw.trim() && lower.includes(kw.trim()));
}

function findMatchingZone(
  pickup: string,
  dropoff: string,
  zones: ZoneRouteConfig[]
): ZoneRouteConfig | undefined {
  return zones
    .filter((z) => z.pickupKeywords.length > 0 && z.dropoffKeywords.length > 0)
    .find(
      (z) =>
        matchesKeywords(pickup, z.pickupKeywords) &&
        matchesKeywords(dropoff, z.dropoffKeywords)
    );
}

// ── Main service ─────────────────────────────────────────────────────────────
export class PricingService implements IPricingService {
  calculate(params: PriceCalculationParams): PriceCalculationResult {
    const {
      serviceType,
      vehicleConfig,
      hourlyCount = 2,
      pickup = '',
      dropoff = '',
      estimatedMiles = 0,
      estimatedMinutes = 0,
      corporateDiscountPct = 0,
    } = params;

    const cfg = {
      rateHourly:     vehicleConfig.rateHourly     ?? FALLBACK_RATE_HOURLY,
      minHours:       vehicleConfig.minHours        ?? FALLBACK_MIN_HOURS,
      ratePerMile:    vehicleConfig.ratePerMile     ?? FALLBACK_RATE_PER_MILE,
      ratePerMinute:  vehicleConfig.ratePerMinute   ?? FALLBACK_RATE_PER_MIN,
      baseFee:        vehicleConfig.baseFee         ?? FALLBACK_BASE_FEE,
      minimumTripFee: vehicleConfig.minimumTripFee  ?? FALLBACK_MIN_TRIP_FEE,
      zoneRoutes:     vehicleConfig.zoneRoutes      ?? [],
    };

    let baseFare       = 0;
    let fareMode: PriceCalculationResult['fareMode'] = 'metered';
    let zoneName: string | undefined;
    let fareFormula    = '';
    let fareDurationLabel = '';

    // ── STEP 1A — Hourly ────────────────────────────────────────────────────
    if (serviceType === 'hourly') {
      const billableHours = Math.max(cfg.minHours, hourlyCount);
      baseFare = cfg.rateHourly * billableHours;
      fareMode = 'hourly';
      fareFormula = `$${cfg.rateHourly}/hr × ${billableHours} hr${billableHours !== 1 ? 's' : ''}`;
      fareDurationLabel = `${billableHours} hr${billableHours !== 1 ? 's' : ''}`;
      if (hourlyCount < cfg.minHours) {
        fareDurationLabel += ` (${cfg.minHours}-hr minimum)`;
      }
    } else {
      // ── STEP 1B — Point-to-Point: Zone Match ─────────────────────────────
      const matchedZone = findMatchingZone(pickup, dropoff, cfg.zoneRoutes);

      if (matchedZone) {
        baseFare  = matchedZone.flatRate;
        fareMode  = 'zone-flat';
        zoneName  = matchedZone.name;
        fareFormula = `Zone flat rate — ${matchedZone.name}`;
        fareDurationLabel = estimatedMinutes
          ? `${estimatedMiles} mi / ${estimatedMinutes} min`
          : `${estimatedMiles} mi`;
      } else {
        // ── STEP 1C — Point-to-Point: Metered ────────────────────────────
        const mileCost = estimatedMiles * cfg.ratePerMile;
        const timeCost = estimatedMinutes * cfg.ratePerMinute;
        const rawFare  = cfg.baseFee + mileCost + timeCost;
        baseFare  = Math.max(rawFare, cfg.minimumTripFee);
        fareMode  = 'metered';

        const wasCapped = rawFare < cfg.minimumTripFee;
        fareFormula = wasCapped
          ? `Min. trip fee (raw $${rawFare.toFixed(2)} < floor $${cfg.minimumTripFee})`
          : `$${cfg.baseFee} base + ${estimatedMiles} mi × $${cfg.ratePerMile} + ${estimatedMinutes} min × $${cfg.ratePerMinute}`;
        fareDurationLabel = `${estimatedMiles} mi / ${estimatedMinutes} min`;
      }
    }

    // ── STEP 2 — Corporate Discount (applied to Step 1 fare only) ───────────
    const clampedPct     = Math.min(Math.max(corporateDiscountPct, 0), 100);
    const discountAmount = Math.round(baseFare * (clampedPct / 100) * 100) / 100;
    const fareAfterDiscount = Math.round((baseFare - discountAmount) * 100) / 100;

    // ── STEP 3 — Tip: not computed here (UI responsibility) ─────────────────

    // ── STEP 4 — Return result ───────────────────────────────────────────────
    const totalBeforeTip = fareAfterDiscount;

    return {
      baseFare:         Math.round(baseFare * 100) / 100,
      fareMode,
      zoneName,
      fareFormula,
      formulaLabel:     fareFormula,
      fareDurationLabel,
      discountAmount,
      fareAfterDiscount,
      totalBeforeTip,
      // Legacy compat fields used by VehicleStep, ConfirmStep, etc.
      totalPrice:   totalBeforeTip.toFixed(2),
      numericTotal: totalBeforeTip,
    };
  }
}

/** Singleton instance */
export const pricingService = new PricingService();
