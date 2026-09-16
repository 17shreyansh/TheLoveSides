import type { Request, Response, NextFunction } from 'express';
import { Category } from '../../models/Category.js';
import { sendSuccess } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';

export async function getActiveCategories(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const categories = await Category.find({
      isActive: true,
      deletedAt: null,
    })
      .sort({ sortOrder: 1 })
      .lean();

    sendSuccess({ res, data: categories });
  } catch (error) {
    next(error);
  }
}

export async function getCategoryBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { slug } = req.params;
    const category = await Category.findOne({
      slug,
      isActive: true,
      deletedAt: null,
    }).lean();

    if (!category) {
      throw ApiError.notFound('Category');
    }

    sendSuccess({ res, data: category });
  } catch (error) {
    next(error);
  }
}
