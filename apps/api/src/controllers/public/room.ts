import type { Request, Response, NextFunction } from 'express';
import { Room } from '../../models/Room.js';
import { sendSuccess } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';

export async function getActiveRooms(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rooms = await Room.find({ isActive: true })
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean();

    sendSuccess({ res, data: rooms });
  } catch (error) {
    next(error);
  }
}

export async function getRoomBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const room = await Room.findOne({ slug: req.params.slug, isActive: true }).lean();
    
    if (!room) {
      throw ApiError.notFound('Room not found');
    }

    sendSuccess({ res, data: room });
  } catch (error) {
    next(error);
  }
}
