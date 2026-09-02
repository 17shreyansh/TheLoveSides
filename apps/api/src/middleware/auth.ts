import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/User.js';
import { AdminUser } from '../models/AdminUser.js';

export interface JwtPayload {
  sub: string;
  type: 'access' | 'refresh';
  role?: string;
  isAdmin?: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role?: string;
        isAdmin: boolean;
      };
    }
  }
}

/**
 * Authenticates customer requests via HttpOnly access token cookie.
 * Populates req.user with verified user data from the database.
 */
export async function authenticateCustomer(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const token = req.cookies?.accessToken;
    if (!token) {
      throw ApiError.unauthorized('Please log in to continue');
    }

    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
    if (decoded.type !== 'access' || decoded.isAdmin) {
      throw ApiError.unauthorized('Invalid token');
    }

    const user = await User.findById(decoded.sub).select('email firstName lastName isActive').lean();
    if (!user) {
      throw ApiError.unauthorized('User no longer exists');
    }
    if (!user.isActive) {
      throw ApiError.forbidden('Your account has been deactivated');
    }

    req.user = {
      id: decoded.sub,
      email: user.email,
      isAdmin: false,
    };

    next();
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      next(ApiError.unauthorized('Invalid or expired token'));
      return;
    }
    next(error);
  }
}

/**
 * Authenticates admin requests via HttpOnly access token cookie.
 * Verifies the admin user exists, is active, and populates req.user with role.
 */
export async function authenticateAdmin(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const token = req.cookies?.adminAccessToken;
    if (!token) {
      throw ApiError.unauthorized('Admin authentication required');
    }

    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
    if (decoded.type !== 'access' || !decoded.isAdmin) {
      throw ApiError.unauthorized('Invalid admin token');
    }

    const admin = await AdminUser.findById(decoded.sub)
      .select('email firstName lastName role isActive')
      .populate('role', 'name permissions')
      .lean();

    if (!admin) {
      throw ApiError.unauthorized('Admin user no longer exists');
    }
    if (!admin.isActive) {
      throw ApiError.forbidden('Your admin account has been deactivated');
    }

    req.user = {
      id: decoded.sub,
      email: admin.email,
      role: ((admin.role as unknown) as { name: string })?.name,
      isAdmin: true,
    };

    next();
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      next(ApiError.unauthorized('Invalid or expired admin token'));
      return;
    }
    next(error);
  }
}

/**
 * Optional authentication — doesn't fail if no token present.
 * Useful for endpoints that behave differently for logged-in vs guest users.
 */
export async function optionalAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const token = req.cookies?.accessToken;
    if (!token) {
      next();
      return;
    }

    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
    if (decoded.type === 'access' && !decoded.isAdmin) {
      const user = await User.findById(decoded.sub).select('email isActive').lean();
      if (user && user.isActive) {
        req.user = {
          id: decoded.sub,
          email: user.email,
          isAdmin: false,
        };
      }
    }
  } catch {
    // Silently ignore invalid tokens for optional auth
  }

  next();
}
