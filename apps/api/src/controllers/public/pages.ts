import { Request, Response, NextFunction } from 'express';
import { CmsPage } from '../../models/CmsPage.js';
import { sendSuccess, sendError } from '../../utils/ApiResponse.js';

export const getPageBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { slug } = req.params;

    const page = await CmsPage.findOne({ 
      slug,
      status: 'published'
    }).select('-__v -publishedBy');

    if (!page) {
      sendError(res, 404, 'NOT_FOUND', 'Page not found');
      return;
    }

    sendSuccess({ res, statusCode: 200, data: page });
  } catch (error) {
    next(error);
  }
};
