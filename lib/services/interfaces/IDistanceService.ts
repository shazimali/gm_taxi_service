/**
 * lib/services/interfaces/IDistanceService.ts
 *
 * S — Single Responsibility: calculates or estimates route distance & duration.
 * O — Open/Closed: implementations can use rule-matching, OSRM, or Google Distance Matrix
 *     without changing calling code.
 */

export interface RouteEstimate {
  miles: number;
  minutes: number;
}

export interface RouteRule {
  name: string;
  matches: (origin: string, destination: string) => boolean;
  estimate: RouteEstimate;
}

export interface IDistanceService {
  estimate(origin: string, destination: string): RouteEstimate;
}
