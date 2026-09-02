import type { Request, Response, NextFunction } from 'express';
import { RateLimiterRedis, RateLimiterMemory } from 'rate-limiter-flexible';
import { getRedis } from '../config/index.js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

let generalLimiter: any = null;
let authLimiter: any = null;

function getGeneralLimiter() {
  if (!generalLimiter) {
    const redisClient = getRedis();
    const opts = {
      keyPrefix: 'rl:general',
      points: env.RATE_LIMIT_MAX_REQUESTS,
      duration: Math.floor(env.RATE_LIMIT_WINDOW_MS / 1000),
      blockDuration: 0,
    };

    if ((redisClient as any).isMock) {
      generalLimiter = new RateLimiterMemory(opts);
    } else {
      generalLimiter = new RateLimiterRedis({ ...opts, storeClient: redisClient });
    }
  }
  return generalLimiter;
}

function getAuthLimiter() {
  if (!authLimiter) {
    const redisClient = getRedis();
    const opts = {
      keyPrefix: 'rl:auth',
      points: env.AUTH_RATE_LIMIT_MAX_REQUESTS,
      duration: Math.floor(env.AUTH_RATE_LIMIT_WINDOW_MS / 1000),
      blockDuration: 60,
    };

    if ((redisClient as any).isMock) {
      authLimiter = new RateLimiterMemory(opts);
    } else {
      authLimiter = new RateLimiterRedis({ ...opts, storeClient: redisClient });
    }
  }
  return authLimiter;
}

/**
 * General API rate limiter. Keyed by IP address.
 */
export async function rateLimitGeneral(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const key = req.ip || req.socket.remoteAddress || 'unknown';
    await getGeneralLimiter().consume(key);
    next();
  } catch {
    next(ApiError.tooManyRequests());
  }
}

/**
 * Stricter rate limiter for authentication endpoints (login, register, password reset).
 * Keyed by IP address to prevent brute-force attacks.
 */
export async function rateLimitAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const key = req.ip || req.socket.remoteAddress || 'unknown';
    await getAuthLimiter().consume(key);
    next();
  } catch {
    next(ApiError.tooManyRequests('Too many authentication attempts. Please try again later.'));
  }
}
