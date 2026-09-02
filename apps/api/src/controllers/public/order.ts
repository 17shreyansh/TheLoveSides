import type { Request, Response, NextFunction } from 'express';
import { Order } from '../../models/Order.js';
import { Payment } from '../../models/Payment.js';
import { Shipment } from '../../models/Shipment.js';
import { Return } from '../../models/Return.js';
import { cancelOrder } from '../../services/order.service.js';
import { sendSuccess, sendPaginated } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';

/**
 * Get customer's own order history.
 */
export async function getMyOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
    const skip = (page - 1) * limit;

    const query = { userId: req.user!.id };

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-adminNotes')
        .lean(),
      Order.countDocuments(query),
    ]);

    sendPaginated(res, orders, {
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
 * Get single order detail (customer — only own orders).
 */
export async function getMyOrderById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;

    const order = await Order.findOne({
      _id: id,
      userId: req.user!.id,
    })
      .select('-adminNotes')
      .lean();

    if (!order) {
      throw ApiError.notFound('Order');
    }

    // Fetch related records for this customer's order
    const [payments, shipments, returns] = await Promise.all([
      Payment.find({ orderId: id, userId: req.user!.id })
        .select('-razorpaySignature')
        .lean(),
      Shipment.find({ orderId: id }).lean(),
      Return.find({ orderId: id, userId: req.user!.id }).lean(),
    ]);

    sendSuccess({
      res,
      data: {
        ...order,
        payments,
        shipments,
        returns,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Customer cancels their own order (only before shipment).
 */
export async function cancelMyOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const { reason } = req.body;

    // Verify ownership
    const order = await Order.findOne({ _id: id, userId: req.user!.id });
    if (!order) {
      throw ApiError.notFound('Order');
    }

    await cancelOrder(id, (reason as string) || 'Cancelled by customer');

    sendSuccess({ res, message: 'Order cancelled successfully' });
  } catch (error) {
    next(error);
  }
}
