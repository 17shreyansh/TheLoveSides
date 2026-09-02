import type { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

declare global {
  namespace Express {
    interface Request {
      cartOwner: {
        type: 'user' | 'guest';
        id: string;
      };
    }
  }
}

/**
 * Identifies the owner of the current cart.
 * MUST be used AFTER optionalAuth (or authenticateCustomer).
 * 
 * If req.user exists, uses user ID.
 * Otherwise, checks for a 'guestId' cookie.
 * If neither exists, generates a new guestId and sets the cookie.
 */
export function cartSession(req: Request, res: Response, next: NextFunction): void {
  // 1. Authenticated User
  if (req.user && !req.user.isAdmin) {
    req.cartOwner = {
      type: 'user',
      id: req.user.id,
    };
    return next();
  }

  // 2. Guest User with existing session
  const existingGuestId = req.cookies?.guestId;
  if (existingGuestId) {
    req.cartOwner = {
      type: 'guest',
      id: existingGuestId,
    };
    return next();
  }

  // 3. New Guest User
  const newGuestId = uuidv4();
  
  // Set cookie for 30 days
  res.cookie('guestId', newGuestId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000, 
  });

  req.cartOwner = {
    type: 'guest',
    id: newGuestId,
  };

  next();
}
