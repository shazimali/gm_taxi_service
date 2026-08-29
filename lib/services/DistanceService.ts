/**
 * lib/services/DistanceService.ts
 *
 * O — Open/Closed Principle: Distance rules are configured as a data array (RouteRule[]).
 *     Adding or modifying city pairs requires adding a new entry to the array,
 *     NOT editing nested if-else ladders inside a component or function.
 */

import type { IDistanceService, RouteEstimate, RouteRule } from './interfaces/IDistanceService';

const ROUTE_RULES: RouteRule[] = [
  {
    name: 'Boston/Logan to NYC/JFK',
    matches: (p, d) =>
      (p.includes('logan') || p.includes('bos') || d.includes('logan') || d.includes('bos')) &&
      (p.includes('nyc') || d.includes('nyc') || p.includes('jfk') || d.includes('jfk') || p.includes('york') || d.includes('york')),
    estimate: { miles: 215.0, minutes: 240 },
  },
  {
    name: 'Boston/Logan to Providence/PVD',
    matches: (p, d) =>
      (p.includes('logan') || p.includes('bos') || d.includes('logan') || d.includes('bos')) &&
      (p.includes('providence') || d.includes('providence') || p.includes('pvd') || d.includes('pvd')),
    estimate: { miles: 58.0, minutes: 65 },
  },
  {
    name: 'Boston/Logan to Cambridge',
    matches: (p, d) =>
      (p.includes('logan') || p.includes('bos') || d.includes('logan') || d.includes('bos')) &&
      (p.includes('cambridge') || d.includes('cambridge')),
    estimate: { miles: 8.5, minutes: 20 },
  },
  {
    name: 'Boston/Logan to Newton',
    matches: (p, d) =>
      (p.includes('logan') || p.includes('bos') || d.includes('logan') || d.includes('bos')) &&
      (p.includes('newton') || d.includes('newton')),
    estimate: { miles: 14.0, minutes: 32 },
  },
  {
    name: 'Boston/Logan to Lexington',
    matches: (p, d) =>
      (p.includes('logan') || p.includes('bos') || d.includes('logan') || d.includes('bos')) &&
      (p.includes('lexington') || d.includes('lexington')),
    estimate: { miles: 18.5, minutes: 38 },
  },
  {
    name: 'Boston/Logan to General Metro Area',
    matches: (p, d) =>
      p.includes('logan') || p.includes('bos') || d.includes('logan') || d.includes('bos'),
    estimate: { miles: 12.5, minutes: 28 },
  },
  {
    name: 'General NYC/Manhattan Trip',
    matches: (p, d) =>
      p.includes('nyc') || d.includes('nyc') || p.includes('manhattan') || d.includes('manhattan'),
    estimate: { miles: 215.0, minutes: 240 },
  },
  {
    name: 'Worcester Route',
    matches: (p, d) => p.includes('worcester') || d.includes('worcester'),
    estimate: { miles: 45.0, minutes: 50 },
  },
];

const DEFAULT_ESTIMATE: RouteEstimate = { miles: 16.0, minutes: 35 };

export class DistanceService implements IDistanceService {
  private readonly rules: RouteRule[];

  constructor(rules: RouteRule[] = ROUTE_RULES) {
    this.rules = rules;
  }

  estimate(origin: string, destination: string): RouteEstimate {
    if (!origin || !destination) {
      return DEFAULT_ESTIMATE;
    }

    const p = origin.toLowerCase().trim();
    const d = destination.toLowerCase().trim();

    const matchedRule = this.rules.find((rule) => rule.matches(p, d));
    return matchedRule ? matchedRule.estimate : DEFAULT_ESTIMATE;
  }
}

/** Singleton instance */
export const distanceService = new DistanceService();
