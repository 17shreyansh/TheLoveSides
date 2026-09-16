import type { Request, Response, NextFunction } from 'express';
import { Category } from '../../models/Category.js';
import { sendSuccess } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';

export async function createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const existing = await Category.findOne({ slug: req.body.slug });
    if (existing) {
      throw ApiError.conflict('Category with this slug already exists');
    }

    const category = await Category.create(req.body);
    sendSuccess({ res, statusCode: 201, data: category, message: 'Category created successfully' });
  } catch (error) {
    next(error);
  }
}

export async function updateCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    
    if (req.body.slug) {
      const existing = await Category.findOne({ slug: req.body.slug, _id: { $ne: id } });
      if (existing) {
        throw ApiError.conflict('Category with this slug already exists');
      }
    }

    const category = await Category.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!category) {
      throw ApiError.notFound('Category');
    }

    sendSuccess({ res, data: category, message: 'Category updated successfully' });
  } catch (error) {
    next(error);
  }
}

export async function deleteCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    
    const category = await Category.findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true });
    if (!category) {
      throw ApiError.notFound('Category');
    }

    sendSuccess({ res, message: 'Category deleted successfully' });
  } catch (error) {
    next(error);
  }
}

export async function reorderCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { items } = req.body;
    
    const bulkOps = items.map((item: { id: string; sortOrder: number }) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { sortOrder: item.sortOrder } }
      }
    }));

    if (bulkOps.length > 0) {
      await Category.bulkWrite(bulkOps);
    }

    sendSuccess({ res, message: 'Categories reordered successfully' });
  } catch (error) {
    next(error);
  }
}
