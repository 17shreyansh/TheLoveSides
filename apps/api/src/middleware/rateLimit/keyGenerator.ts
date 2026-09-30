import type { Request } from 'express';

/**
 * Gets the client IP address safely, respecting trust proxy.
 * If behind Cloudflare or similar, make sure app.set('trust proxy', 1) is correct,
 * or use specific headers like 'cf-connecting-ip' if necessary.
 * For now, we rely on Express `req.ip` which is populated correctly when `trust proxy` is set.
 */
export function getClientIp(req: Request): string {
  // Try Cloudflare header first if you use CF
  const cfIp = req.headers['cf-connecting-ip'];
  if (cfIp && typeof cfIp === 'string') {
    return cfIp.split(',')[0].trim();
  }

  // Fallback to Express req.ip
  return req.ip || req.socket.remoteAddress || 'unknown';
}

/**
 * Normalizes an email for use as a rate limit key.
 */
export function normalizeEmail(email?: string): string {
  if (!email) return 'unknown';
  return email.trim().toLowerCase();
}
