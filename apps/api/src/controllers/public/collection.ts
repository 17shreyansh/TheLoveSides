import type { Request, Response, NextFunction } from 'express';
import { Collection } from '../../models/Collection.js';
import { sendSuccess } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';

export async function getActiveCollections(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const now = new Date();
    const collections = await Collection.find({
      isActive: true,
      deletedAt: null,
      $or: [
        { startDate: null, endDate: null },
        { startDate: { $lte: now }, endDate: null },
        { startDate: null, endDate: { $gte: now } },
        { startDate: { $lte: now }, endDate: { $gte: now } },
      ],
    })
      .sort({ sortOrder: 1 })
      .lean();

    sendSuccess({ res, data: collections });
  } catch (error) {
    next(error);
  }
}

export async function getCollectionBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { slug } = req.params;
    const collection = await Collection.findOne({
      slug,
      isActive: true,
      deletedAt: null,
    }).lean();

    if (!collection) {
      throw ApiError.notFound('Collection');
    }

    sendSuccess({ res, data: collection });
  } catch (error) {
    next(error);
  }
}
