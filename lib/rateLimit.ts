import { redisConnection } from '@/lib/redis';

/**
 * Redis-backed sliding-window rate limiter.
 *
 * Uses Redis INCR + EXPIRE so limits survive server restarts and work
 * correctly across multiple Next.js worker processes.
 *
 * Falls back to allowing the request when Redis is unreachable (e.g. local
 * dev without Redis running) so development is never blocked.
 *
 * @param key      Unique identifier for this rate-limit bucket (e.g. `login_<ip>`)
 * @param limit    Maximum requests allowed within the window
 * @param windowMs Time window in milliseconds
 */
export async function rateLimit(
  key: string,
  limit: number = 5,
  windowMs: number = 60 * 1000
): Promise<{ success: boolean; limit: number; remaining: number; resetTime: number }> {
  const windowSec = Math.ceil(windowMs / 1000);
  const redisKey = `rl:${key}`;

  try {
    // INCR atomically increments (creates key at 0 if absent)
    const count = await redisConnection.incr(redisKey);

    // Set expiry only on first request in the window
    if (count === 1) {
      await redisConnection.expire(redisKey, windowSec);
    }

    // Get the remaining TTL so we can return an accurate resetTime
    const ttl = await redisConnection.ttl(redisKey);
    const resetTime = Date.now() + ttl * 1000;

    if (count > limit) {
      return { success: false, limit, remaining: 0, resetTime };
    }

    return { success: true, limit, remaining: limit - count, resetTime };
  } catch {
    // Redis unavailable — fail open so the app stays usable (log in dev)
    if (process.env.NODE_ENV === 'development') {
      console.debug('[rateLimit] Redis unavailable, skipping rate limit check.');
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

