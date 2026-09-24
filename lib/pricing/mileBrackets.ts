/**
 * lib/pricing/mileBrackets.ts
 *
 * Tiered (progressive) per-mile pricing, shared by server and client.
 *
 * A vehicle has a Base Fare covering the first `baseMiles`, followed by N
 * mileage brackets. Each bracket stores only its upper bound; its lower bound
 * is the previous bracket's upper bound (or `baseMiles` for the first one).
 * The last bracket is open-ended (`upToMiles: null`).
 *
 * Example — baseFare $120, baseMiles 10, brackets:
 *   [{ upToMiles: 30, ratePerMile: 4 }, { upToMiles: 70, ratePerMile: 3.25 },
 *    { upToMiles: null, ratePerMile: 2.5 }]
 * A 100-mile trip = 120 + 20×4 + 40×3.25 + 30×2.5 = $405.
 *
 * Miles are treated as continuous: a 45.3-mile trip charges 20 mi in the first
 * bracket and 15.3 mi in the second. "11–30" style labels are display only.
 */

export interface MileBracket {
  /** Upper bound in miles (inclusive). `null` = open-ended final bracket. */
  upToMiles: number | null;
  ratePerMile: number;
}

export interface FareBreakdownLine {
  /** Lower bound (exclusive) of the segment, in miles. */
  from: number;
  /** Upper bound of the bracket, `null` when open-ended. */
  to: number | null;
  /** Miles actually charged in this segment. */
  miles: number;
  rate: number;
  amount: number;
}

export interface TieredFareResult {
  total: number;
  baseFare: number;
  breakdown: FareBreakdownLine[];
}

const roundCents = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
const roundMiles = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

/** Parses a JSON string or array into brackets. Returns [] for invalid input. */
export function parseMileBrackets(raw: unknown): MileBracket[] {
  let value = raw;
  if (typeof value === 'string') {
    if (!value.trim()) return [];
    try {
      value = JSON.parse(value);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(value)) return [];

  const out: MileBracket[] = [];
  for (const item of value) {
    if (!item || typeof item !== 'object') return [];
    const { upToMiles, ratePerMile } = item as Record<string, unknown>;
    const rate = Number(ratePerMile);
    const upper =
      upToMiles === null || upToMiles === undefined || upToMiles === ''
        ? null
        : Number(upToMiles);
    if (!Number.isFinite(rate) || (upper !== null && !Number.isFinite(upper))) return [];
    out.push({ upToMiles: upper, ratePerMile: rate });
  }
  return out;
}

/** Returns an error message, or null when the brackets are valid. */
export function validateMileBrackets(brackets: MileBracket[], baseMiles: number): string | null {
  if (brackets.length === 0) return null;

  let lower = baseMiles;
  for (let i = 0; i < brackets.length; i++) {
    const { upToMiles, ratePerMile } = brackets[i];
    const isLast = i === brackets.length - 1;
    const label = `Bracket ${i + 1}`;

    if (!Number.isFinite(ratePerMile) || ratePerMile < 0) {
      return `${label}: rate per mile must be 0 or more.`;
    }
    if (isLast) {
      if (upToMiles !== null) return 'The last bracket must be open-ended (no upper mile limit).';
    } else {
      if (upToMiles === null || !Number.isFinite(upToMiles)) {
        return `${label}: "To" miles is required. Only the last bracket can be open-ended.`;
      }
      if (upToMiles <= lower) {
        return `${label}: "To" miles must be greater than ${lower}.`;
      }
      lower = upToMiles;
    }
  }
  return null;
}

/** Progressive fare: base fare + each bracket's rate × miles inside that bracket. */
export function computeTieredFare(
  miles: number,
  baseFare: number,
  baseMiles: number,
  brackets: MileBracket[]
): TieredFareResult {
  const breakdown: FareBreakdownLine[] = [];
  let total = baseFare;

  if (miles > baseMiles) {
    let lower = baseMiles;
    for (const { upToMiles, ratePerMile } of brackets) {
      const upper = upToMiles ?? Infinity;
      const segmentMiles = Math.min(miles, upper) - lower;
      if (segmentMiles > 0) {
        const amount = segmentMiles * ratePerMile;
        total += amount;
        breakdown.push({
          from: lower,
          to: upToMiles,
          miles: roundMiles(segmentMiles),
          rate: ratePerMile,
          amount: roundCents(amount),
        });
      }
      if (miles <= upper) break;
      lower = upper;
    }
  }

  return { total: roundCents(total), baseFare, breakdown };
}

/** Human-readable range label, e.g. "11–30 mi" or "71+ mi". */
export function bracketRangeLabel(from: number, to: number | null): string {
  const start = Number.isInteger(from) ? from + 1 : from;
  return to === null ? `${start}+ mi` : `${start}–${to} mi`;
}
