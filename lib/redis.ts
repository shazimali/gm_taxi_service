import Redis from 'ioredis';

const redisHost = process.env.REDIS_HOST || '127.0.0.1';
const redisPort = Number(process.env.REDIS_PORT) || 6379;

// Singleton Redis connection for BullMQ and application queues
const globalForRedis = globalThis as unknown as {
  redisConnection: Redis | undefined;
};

export const redisConnection =
  globalForRedis.redisConnection ??
  new Redis({
    host: redisHost,
    port: redisPort,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    lazyConnect: true,
    // Fail fast when Redis is unavailable (e.g. local dev without Redis)
    // so API routes don't hang waiting for a connection
    connectTimeout: 500,
    commandTimeout: 1000,
    retryStrategy(times) {
      // Stop retrying after 2 attempts in dev to prevent hangs
      if (process.env.NODE_ENV === 'development' && times > 2) return null;
      // Reconnect strategy with backoff up to 3 seconds max
      return Math.min(times * 200, 3000);
    },
  });

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redisConnection = redisConnection;
}

redisConnection.on('connect', () => {
  console.log(`[Redis] Connected successfully to ${redisHost}:${redisPort}`);
});

redisConnection.on('error', (err) => {
  // Silent warning for offline local Redis
  if (process.env.NODE_ENV === 'development') {
    // console.debug('[Redis] Offline fallback');
  }
});
