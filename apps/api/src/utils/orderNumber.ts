import { getRedis } from '../config/redis.js';

const COUNTER_KEY_PREFIX = 'order_counter';

/**
 * Generate a human-friendly order number.
 * Format: TLS-{YEAR}-{6-DIGIT-SEQUENCE}
 * Example: TLS-2026-000001
 *
 * Uses Redis INCR for atomic, distributed-safe incrementing.
 */
export async function generateOrderNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const key = `${COUNTER_KEY_PREFIX}:${year}`;
  const redis = getRedis();
  const sequence = await redis.incr(key);

  // Set TTL to expire counters from previous years (2 years buffer)
  if (sequence === 1) {
    await redis.expire(key, 63072000); // 2 years in seconds
  }

  const paddedSequence = String(sequence).padStart(6, '0');
  return `TLS-${year}-${paddedSequence}`;
}
