import type { Request, Response, NextFunction } from 'express';
import { SubCategory } from '../../models/SubCategory.js';
import { sendSuccess } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';

export async function createSubCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const existing = await SubCategory.findOne({ slug: req.body.slug });
    if (existing) {
      throw ApiError.conflict('SubCategory with this slug already exists');
    }

    const subCategory = await SubCategory.create(req.body);
    sendSuccess({ res, statusCode: 201, data: subCategory, message: 'SubCategory created successfully' });
  } catch (error) {
    next(error);
  }
}

export async function updateSubCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    
    if (req.body.slug) {
      const existing = await SubCategory.findOne({ slug: req.body.slug, _id: { $ne: id } });
      if (existing) {
        throw ApiError.conflict('SubCategory with this slug already exists');
      }
    }

    const subCategory = await SubCategory.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!subCategory) {
      throw ApiError.notFound('SubCategory');
    }

    sendSuccess({ res, data: subCategory, message: 'SubCategory updated successfully' });
  } catch (error) {
    next(error);
  }
}

export async function deleteSubCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    
    const subCategory = await SubCategory.findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true });
    if (!subCategory) {
      throw ApiError.notFound('SubCategory');
    }

    sendSuccess({ res, message: 'SubCategory deleted successfully' });
  } catch (error) {
    next(error);
  }
}

export async function reorderSubCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { items } = req.body;
    
    const bulkOps = items.map((item: { id: string; sortOrder: number }) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { sortOrder: item.sortOrder } }
      }
    }));

    if (bulkOps.length > 0) {
      await SubCategory.bulkWrite(bulkOps);
    }

    sendSuccess({ res, message: 'SubCategories reordered successfully' });
  } catch (error) {
    next(error);
  }
}
