import type { Request, Response, NextFunction } from 'express';
import { Room } from '../../models/Room.js';
import { ApiError } from '../../utils/ApiError.js';
import { sendSuccess } from '../../utils/ApiResponse.js';

export const createRoom = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const existing = await Room.findOne({ slug: req.body.slug });
    if (existing) {
      throw ApiError.badRequest('Room with this slug already exists');
    }

    const room = await Room.create(req.body);
    sendSuccess({ res, status: 201, data: room, message: 'Room created successfully' });
  } catch (error) {
    next(error);
  }
};

export const updateRoom = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.body.slug) {
      const existing = await Room.findOne({
        slug: req.body.slug,
        _id: { $ne: req.params.id },
      });
      if (existing) {
        throw ApiError.badRequest('Room with this slug already exists');
      }
    }

    const room = await Room.findOneAndUpdate(
      { _id: req.params.id, deletedAt: null },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!room) {
      throw ApiError.notFound('Room not found');
    }

    sendSuccess({ res, data: room, message: 'Room updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const deleteRoom = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const room = await Room.findOneAndUpdate(
      { _id: req.params.id, deletedAt: null },
      { $set: { deletedAt: new Date(), isActive: false } },
      { new: true }
    );

    if (!room) {
      throw ApiError.notFound('Room not found');
    }

    sendSuccess({ res, data: room, message: 'Room deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const reorderRooms = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { items } = req.body;
    
    const bulkOps = items.map((item: { id: string; sortOrder: number }) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { sortOrder: item.sortOrder } }
      }
    }));

    if (bulkOps.length > 0) {
      await Room.bulkWrite(bulkOps);
    }

    sendSuccess({ res, message: 'Rooms reordered successfully' });
  } catch (error) {
    next(error);
  }
};
