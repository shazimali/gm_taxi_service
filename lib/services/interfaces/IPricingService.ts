/**
 * lib/services/interfaces/IPricingService.ts
 *
 * S — Single Responsibility: type contracts for the pricing engine.
 *
 * Step 1 — Determine the Fare (Hourly | Metered: base fare + tiered per-mile brackets)
 * Step 2 — Optional Tip (UI only — not computed here)
 * Step 3 — Output (Fare + Tip = Total)
 */

import type { MileBracket, FareBreakdownLine } from '@/lib/pricing/mileBrackets';

export type { MileBracket, FareBreakdownLine };

// ── Per-vehicle pricing configuration (loaded from DB) ────────────────────────
export interface VehiclePricingConfig {
  rateHourly: number;
  baseFare: number | null;    // flat fare for trips at or under baseMiles
  baseMiles: number | null;   // distance threshold covered by baseFare
  perMileRate: number | null; // legacy single $/mile rate; used when mileBrackets is empty
  mileBrackets: MileBracket[]; // tiered $/mile brackets beyond baseMiles (last is open-ended)
}

// ── Input params for PricingService.calculate() ───────────────────────────────
export interface PriceCalculationParams {
  serviceType: 'hourly' | 'point-to-point';
  vehicleConfig: VehiclePricingConfig;

  // Hourly inputs
  hourlyCount?: number;

  // Point-to-Point inputs
  estimatedMiles?: number;
  estimatedMinutes?: number; // real-time traffic duration from Google Routes API
}

// ── Output from PricingService.calculate() ────────────────────────────────────
export interface PriceCalculationResult {
  // Step 1 — Fare determination
  baseFare: number;
  fareMode: 'hourly' | 'metered';
  fareFormula: string;          // human-readable formula, e.g. "$85/hr × 3 hrs"
  formulaLabel?: string;        // alias for legacy compatibility
  fareDurationLabel: string;    // e.g. "3 hrs" or "22 mins (8.5 mi)"
  fareBreakdown?: FareBreakdownLine[]; // metered only: per-bracket miles × rate lines
  meteredBaseFare?: number;            // metered only: flat fare covering the base miles

  // Step 2 — Tip (not computed here; 0 until customer selects)
  // tipAmount is caller responsibility

  // Step 3 — Total before tip (= baseFare)
  totalBeforeTip: number;

  // Legacy compatibility (used by existing VehicleStep / ConfirmStep)
  totalPrice: string;           // formatted "127.50"
  numericTotal: number;         // same as totalBeforeTip
}

// ── Service contract ──────────────────────────────────────────────────────────
export interface IPricingService {
  calculate(params: PriceCalculationParams): PriceCalculationResult;
}
