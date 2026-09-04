import { Redis } from 'ioredis';
import RedisMock from 'ioredis-mock';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

let redisClient: Redis | null = null;

export function getRedis(): Redis {
  if (!redisClient) {
    throw new Error('Redis client not initialized');
  }
  return redisClient;
}

export async function connectRedis(): Promise<Redis> {
  if (redisClient) return redisClient;

  redisClient = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: 1,
    retryStrategy(times: number) {
      if (times > 1) return null; // Stop retrying
      return 100;
    },
    lazyConnect: true,
  });

  redisClient.on('connect', () => {
    logger.info('✅ Redis connected');
  });

  redisClient.on('error', (_err: Error) => {
    // Only log if it's not the initial failure that we're catching
  });

  try {
    await redisClient.connect();
    return redisClient;
  } catch (err) {
    logger.warn('Failed to connect to real Redis, falling back to ioredis-mock...');
    const mock = new RedisMock() as unknown as Redis;
    (mock as any).isMock = true;
    redisClient = mock;
    return redisClient;
  }
}

export async function disconnectRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    logger.info('Redis disconnected');
  }
}
