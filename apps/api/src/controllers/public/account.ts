import type { Request, Response, NextFunction } from 'express';
import { User } from '../../models/User.js';
import { sendSuccess } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';

/**
 * Get current customer's profile.
 */
export async function getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await User.findById(req.user!.id).select('-__v').lean();
    if (!user) {
      throw ApiError.notFound('User');
    }
    sendSuccess({ res, data: user });
  } catch (error) {
    next(error);
  }
}

/**
 * Update current customer's profile.
 */
export async function updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { firstName, lastName, phone } = req.body;

    const updateData: Record<string, unknown> = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (phone !== undefined) updateData.phone = phone;

    const user = await User.findByIdAndUpdate(
      req.user!.id,
      updateData,
      { new: true, runValidators: true },
    ).select('-__v').lean();

    if (!user) {
      throw ApiError.notFound('User');
    }

    sendSuccess({ res, data: user, message: 'Profile updated' });
  } catch (error) {
    next(error);
  }
}
