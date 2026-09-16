import { getRedis } from '../config/redis.js';
import { Order } from '../models/Order.js';

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

  // If using mock redis (e.g. local dev without real redis) and key doesn't exist,
  // seed it from the latest order in the database to prevent E11000 duplicate key errors
  const exists = await redis.exists(key);
  if (!exists && (redis as any).isMock) {
    const lastOrder = await Order.findOne({ orderNumber: new RegExp(`^TLS-${year}-`) })
      .sort({ orderNumber: -1 })
      .lean();
      
    if (lastOrder && lastOrder.orderNumber) {
      const parts = lastOrder.orderNumber.split('-');
      if (parts.length === 3) {
        const lastSeq = parseInt(parts[2], 10);
        if (!isNaN(lastSeq)) {
          await redis.set(key, lastSeq);
        }
      }
    }
  }

  const sequence = await redis.incr(key);

  // Set TTL to expire counters from previous years (2 years buffer)
  if (sequence === 1) {
    await redis.expire(key, 63072000); // 2 years in seconds
  }

  const paddedSequence = String(sequence).padStart(6, '0');
  return `TLS-${year}-${paddedSequence}`;
}
