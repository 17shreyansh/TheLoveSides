import type { Request, Response, NextFunction } from 'express';
import { Review } from '../../models/Review.js';
import { sendSuccess, sendPaginated } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';
import { createAuditLog } from '../../services/audit.service.js';

export async function listReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const skip = (page - 1) * limit;

    const query: any = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.productId) query.productId = req.query.productId;

    const [reviews, total] = await Promise.all([
      Review.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'email firstName lastName')
        .populate('productId', 'name')
        .lean(),
      Review.countDocuments(query),
    ]);

    sendPaginated(res, reviews, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateReviewStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const { status } = req.body;

    const review = await Review.findByIdAndUpdate(id, { status }, { new: true });
    if (!review) {
      throw ApiError.notFound('Review not found');
    }

    await createAuditLog({
      action: 'review.moderate',
      resource: 'Review',
      resourceId: id,
      details: { newStatus: status },
      req,
    });

    sendSuccess({ res, data: review, message: `Review status updated to ${status}` });
  } catch (error) {
    next(error);
  }
}
