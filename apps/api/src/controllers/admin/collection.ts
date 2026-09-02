import type { Request, Response, NextFunction } from 'express';
import { Collection } from '../../models/Collection.js';
import { sendSuccess } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';

export async function createCollection(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const existing = await Collection.findOne({ slug: req.body.slug });
    if (existing) {
      throw ApiError.conflict('Collection with this slug already exists');
    }

    const collection = await Collection.create(req.body);
    sendSuccess({ res, statusCode: 201, data: collection, message: 'Collection created successfully' });
  } catch (error) {
    next(error);
  }
}

export async function updateCollection(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    
    if (req.body.slug) {
      const existing = await Collection.findOne({ slug: req.body.slug, _id: { $ne: id } });
      if (existing) {
        throw ApiError.conflict('Collection with this slug already exists');
      }
    }

    const collection = await Collection.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!collection) {
      throw ApiError.notFound('Collection');
    }

    sendSuccess({ res, data: collection, message: 'Collection updated successfully' });
  } catch (error) {
    next(error);
  }
}

export async function deleteCollection(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    
    const collection = await Collection.findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true });
    if (!collection) {
      throw ApiError.notFound('Collection');
    }

    sendSuccess({ res, message: 'Collection deleted successfully' });
  } catch (error) {
    next(error);
  }
}

export async function reorderCollections(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { items } = req.body;
    
    const bulkOps = items.map((item: { id: string; sortOrder: number }) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { sortOrder: item.sortOrder } }
      }
    }));

    if (bulkOps.length > 0) {
      await Collection.bulkWrite(bulkOps);
    }

    sendSuccess({ res, message: 'Collections reordered successfully' });
  } catch (error) {
    next(error);
  }
}
