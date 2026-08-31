import { redisConnection } from '@/lib/redis';

// ── Storage abstraction (D — Dependency Inversion) ────────────────────────────
// rateLimit() depends on this interface, not on a concrete Redis client.
// Swap the default to any compatible store (Upstash, in-memory, etc.)
// without touching this file.
export interface RateLimitStore {
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<void>;
  ttl(key: string): Promise<number>;
}

// ── Default store: thin adapter over ioredis ──────────────────────────────────
// ioredis has overloaded expire() signatures that don't directly satisfy
// RateLimitStore, so we wrap it in a plain object that matches exactly.
const redisStore: RateLimitStore = {
  incr:   (key)          => redisConnection.incr(key),
  expire: (key, seconds) => redisConnection.expire(key, seconds).then(() => void 0),
  ttl:    (key)          => redisConnection.ttl(key),
};

/**
 * Redis-backed sliding-window rate limiter.
 *
 * Uses Redis INCR + EXPIRE so limits survive server restarts and work
 * correctly across multiple Next.js worker processes.
 *
 * Falls back to allowing the request when the store is unreachable (e.g. local
 * dev without Redis running) so development is never blocked.
 *
 * @param key      Unique identifier for this rate-limit bucket (e.g. `login_<ip>`)
 * @param limit    Maximum requests allowed within the window
 * @param windowMs Time window in milliseconds
 * @param store    Storage backend — defaults to the shared Redis connection
 */
export async function rateLimit(
  key: string,
  limit: number = 5,
  windowMs: number = 60 * 1000,
  store: RateLimitStore = redisStore
): Promise<{ success: boolean; limit: number; remaining: number; resetTime: number }> {
  const windowSec = Math.ceil(windowMs / 1000);
  const redisKey = `rl:${key}`;

  try {
    // INCR atomically increments (creates key at 0 if absent)
    const count = await store.incr(redisKey);

    // Set expiry only on first request in the window
    if (count === 1) {
      await store.expire(redisKey, windowSec);
    }

    // Get the remaining TTL so we can return an accurate resetTime
    const ttl = await store.ttl(redisKey);
    const resetTime = Date.now() + ttl * 1000;

    if (count > limit) {
      return { success: false, limit, remaining: 0, resetTime };
    }

    return { success: true, limit, remaining: limit - count, resetTime };
  } catch {
    // Store unavailable — fail open so the app stays usable (log in dev)
    if (process.env.NODE_ENV === 'development') {
      console.debug('[rateLimit] Store unavailable, skipping rate limit check.');
    }
    return { success: true, limit, remaining: limit, resetTime: Date.now() + windowMs };
  }
}

export function getClientIp(req: Request): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  return '127.0.0.1';
}

