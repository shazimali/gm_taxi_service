/**
 * lib/services/interfaces/IPricingService.ts
 *
 * S — Single Responsibility: type contracts for the 4-step pricing engine.
 *
 * Step 1 — Determine the Fare (Hourly | Zone Flat | Metered: base-fare/base-miles/per-mile threshold)
 * Step 2 — Apply Corporate Discount (% off Step 1 fare only)
 * Step 3 — Optional Tip (UI only — not computed here)
 * Step 4 — Output (Fare + Tip = Total)
 */

// ── Zone Route config (loaded from DB, passed in) ─────────────────────────────
export interface ZoneRouteConfig {
  id: string;
  name: string;
  pickupKeywords: string[];   // lowercase; any match triggers the zone
  dropoffKeywords: string[];  // lowercase; any match triggers the zone
  flatRate: number;
}

// ── Per-vehicle pricing configuration (loaded from DB) ────────────────────────
export interface VehiclePricingConfig {
  rateHourly: number;
  baseFare: number | null;    // flat fare for trips at or under baseMiles
  baseMiles: number | null;   // distance threshold covered by baseFare
  perMileRate: number | null; // $/mile applied to total distance when over baseMiles
  zoneRoutes: ZoneRouteConfig[];
}

// ── Input params for PricingService.calculate() ───────────────────────────────
export interface PriceCalculationParams {
  serviceType: 'hourly' | 'point-to-point';
  vehicleConfig: VehiclePricingConfig;

  // Hourly inputs
  hourlyCount?: number;

  // Point-to-Point inputs
  pickup?: string;
  dropoff?: string;
  estimatedMiles?: number;
  estimatedMinutes?: number; // real-time traffic duration from Google Routes API

  // Step 2 — optional corporate discount percentage (0-100)
  corporateDiscountPct?: number;
}

// ── Output from PricingService.calculate() ────────────────────────────────────
export interface PriceCalculationResult {
  // Step 1 — Fare determination
  baseFare: number;
  fareMode: 'hourly' | 'zone-flat' | 'metered';
  zoneName?: string;            // set when fareMode === 'zone-flat'
  fareFormula: string;          // human-readable formula, e.g. "$85/hr × 3 hrs"
  formulaLabel?: string;        // alias for legacy compatibility
  fareDurationLabel: string;    // e.g. "3 hrs" or "22 mins (8.5 mi)"

  // Step 2 — Corporate discount
  discountAmount: number;
  fareAfterDiscount: number;    // = baseFare - discountAmount

  // Step 3 — Tip (not computed here; 0 until customer selects)
  // tipAmount is caller responsibility

  // Step 4 — Total before tip (= fareAfterDiscount)
  totalBeforeTip: number;

  // Legacy compatibility (used by existing VehicleStep / ConfirmStep)
  totalPrice: string;           // formatted "127.50"
  numericTotal: number;         // same as totalBeforeTip
}

// ── Service contract ──────────────────────────────────────────────────────────
export interface IPricingService {
  calculate(params: PriceCalculationParams): PriceCalculationResult;
}
