import type { Request, Response, NextFunction } from 'express';
import { User } from '../../models/User.js';
import { Order } from '../../models/Order.js';
import { sendSuccess, sendPaginated } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';

/**
 * List customers (admin) with pagination and search.
 */
export async function listCustomers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = { deletedAt: null };

    if (req.query.search) {
      const search = req.query.search as string;
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    if (req.query.isActive !== undefined) {
      query.isActive = req.query.isActive === 'true';
    }

    const [customers, total] = await Promise.all([
      User.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-__v')
        .lean(),
      User.countDocuments(query),
    ]);

    sendPaginated(res, customers, {
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

/**
 * Get single customer detail (admin) with order summary.
 */
export async function getCustomerById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    const customer = await User.findById(id).select('-__v').lean();
    if (!customer) {
      throw ApiError.notFound('Customer');
    }

    // Get order summary
    const [orderCount, totalSpent] = await Promise.all([
      Order.countDocuments({ userId: id, status: { $ne: 'CANCELLED' } }),
      Order.aggregate([
        { $match: { userId: customer._id, status: { $nin: ['CANCELLED', 'REFUNDED', 'PENDING_PAYMENT', 'PAYMENT_FAILED'] } } },
        { $group: { _id: null, total: { $sum: '$grandTotal' } } },
      ]),
    ]);

    sendSuccess({
      res,
      data: {
        ...customer,
        orderCount,
        totalSpent: totalSpent[0]?.total || 0,
      },
    });
  } catch (error) {
    next(error);
  }
}
