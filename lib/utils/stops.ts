/**
 * lib/utils/stops.ts
 *
 * Booking.stops is stored as a JSON-encoded string array of intermediate
 * ride stop addresses. This is the single place that decodes it back.
 */
export function parseStops(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === 'string') : [];
  } catch {
    return [];
  }
}
