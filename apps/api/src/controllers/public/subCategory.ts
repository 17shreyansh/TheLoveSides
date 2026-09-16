import type { Request, Response, NextFunction } from 'express';
import { SubCategory } from '../../models/SubCategory.js';
import { sendSuccess } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';

export async function getActiveSubCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { categoryId } = req.query;
    
    const query: any = {
      isActive: true,
      deletedAt: null,
    };
    
    if (categoryId) {
      query.categoryIds = categoryId;
    }

    const subCategories = await SubCategory.find(query)
      .sort({ sortOrder: 1 })
      .lean();

    sendSuccess({ res, data: subCategories });
  } catch (error) {
    next(error);
  }
}

export async function getSubCategoryBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { slug } = req.params;
    const subCategory = await SubCategory.findOne({
      slug,
      isActive: true,
      deletedAt: null,
    }).lean();

    if (!subCategory) {
      throw ApiError.notFound('SubCategory');
    }

    sendSuccess({ res, data: subCategory });
  } catch (error) {
    next(error);
  }
}
