// ── Storage abstraction (D — Dependency Inversion) ────────────────────────────
// rateLimit() depends on this interface, not on a concrete store.
// Swap the default to Redis (Upstash, ioredis) or any compatible store
// without touching this file.
export interface RateLimitStore {
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<void>;
  ttl(key: string): Promise<number>;
}

// ── Default store: in-memory (no Redis required) ──────────────────────────────
// Each entry tracks { count, expiresAt } in a plain Map.
// Works correctly within a single Node.js process (one Next.js worker).
// NOTE: counters reset on server restart and are NOT shared across multiple
// worker processes. For a multi-process/multi-instance production setup,
// swap this store for a Redis-backed one.
interface MemEntry { count: number; expiresAt: number }
const memCache = new Map<string, MemEntry>();

const memStore: RateLimitStore = {
  async incr(key) {
    const now = Date.now();
    const entry = memCache.get(key);

    if (!entry || now >= entry.expiresAt) {
      // First hit or window expired — create a fresh entry
      memCache.set(key, { count: 1, expiresAt: 0 }); // expiresAt set by expire()
      return 1;
    }

    entry.count += 1;
    return entry.count;
  },

  async expire(key, seconds) {
    const entry = memCache.get(key);
    if (entry) {
      entry.expiresAt = Date.now() + seconds * 1000;
    }
  },

  async ttl(key) {
    const entry = memCache.get(key);
    if (!entry || entry.expiresAt === 0) return -1;
    const remaining = Math.ceil((entry.expiresAt - Date.now()) / 1000);
    return remaining > 0 ? remaining : -2;
  },
};

/**
 * In-memory sliding-window rate limiter.
 *
 * Protects endpoints (e.g. login) from brute-force attacks.
 * No external dependencies — works without Redis.
 *
 * @param key      Unique identifier for this rate-limit bucket (e.g. `login_<ip>`)
 * @param limit    Maximum requests allowed within the window
 * @param windowMs Time window in milliseconds
 * @param store    Storage backend — defaults to the in-memory store
 */
export async function rateLimit(
  key: string,
  limit: number = 5,
  windowMs: number = 60 * 1000,
  store: RateLimitStore = memStore
): Promise<{ success: boolean; limit: number; remaining: number; resetTime: number }> {
  const windowSec = Math.ceil(windowMs / 1000);
  const storeKey = `rl:${key}`;

  try {
    // Increment atomically (creates key at 1 if absent)
    const count = await store.incr(storeKey);

    // Set expiry only on first request in the window
    if (count === 1) {
      await store.expire(storeKey, windowSec);
    }

    // Get remaining TTL to return an accurate resetTime
    const ttl = await store.ttl(storeKey);
    const resetTime = Date.now() + ttl * 1000;

    if (count > limit) {
      return { success: false, limit, remaining: 0, resetTime };
    }

    return { success: true, limit, remaining: limit - count, resetTime };
  } catch {
    // Store error — fail open so the app stays usable
    if (process.env.NODE_ENV === 'development') {
      console.debug('[rateLimit] Store error, skipping rate limit check.');
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
