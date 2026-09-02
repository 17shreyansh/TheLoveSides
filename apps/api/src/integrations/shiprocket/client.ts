import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';
import { getRedis } from '../../config/redis.js';

export const isShiprocketConfigured = Boolean(env.SHIPROCKET_EMAIL && env.SHIPROCKET_PASSWORD);
const SHIPROCKET_API_URL = env.SHIPROCKET_API_URL || 'https://apiv2.shiprocket.in/v1/external';

/**
 * Authenticates with Shiprocket and caches the JWT token in Redis.
 * The token typically expires in 10 days. We cache it for 9 days.
 */
export async function getShiprocketToken(): Promise<string> {
  if (!isShiprocketConfigured) {
    throw new Error('Shiprocket credentials missing');
  }

  const cacheKey = 'shiprocket:auth_token';
  const redis = getRedis();
  const cachedToken = await redis.get(cacheKey);

  if (cachedToken) {
    return cachedToken;
  }

  try {
    const response = await fetch(`${SHIPROCKET_API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: env.SHIPROCKET_EMAIL,
        password: env.SHIPROCKET_PASSWORD,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error({ status: response.status, errorText }, 'Shiprocket auth failed');
      throw new Error(`Shiprocket auth failed: ${response.status}`);
    }

    const data = await response.json() as any;
    const token = data.token;

    // Cache for 9 days (777600 seconds)
    await redis.setex(cacheKey, 777600, token);

    return token;
  } catch (error) {
    logger.error({ err: error }, 'Error obtaining Shiprocket token');
    throw error;
  }
}

/**
 * Generic fetch wrapper for Shiprocket API authenticated requests.
 */
export async function shiprocketFetch(endpoint: string, options: RequestInit = {}) {
  const token = await getShiprocketToken();
  const url = `${SHIPROCKET_API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });
  
  if (response.status === 401) {
    // Token might have been invalidated, clear cache and retry once
    const redis = getRedis();
    await redis.del('shiprocket:auth_token');
    const newToken = await getShiprocketToken();
    headers['Authorization'] = `Bearer ${newToken}`;
    return fetch(url, { ...options, headers });
  }

  return response;
}
