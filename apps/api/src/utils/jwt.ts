import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import type { JwtPayload } from '../middleware/auth.js';

export function generateAccessToken(userId: string, isAdmin = false): string {
  const payload: JwtPayload = {
    sub: userId,
    type: 'access',
    isAdmin,
  };

  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRY as any,
  });
}

export function generateRefreshToken(userId: string, isAdmin = false): string {
  const payload: JwtPayload = {
    sub: userId,
    type: 'refresh',
    isAdmin,
  };

  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRY as any,
  });
}
