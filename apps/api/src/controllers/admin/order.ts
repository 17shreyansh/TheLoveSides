import type { Request, Response, NextFunction } from 'express';
import { Order, type OrderStatus } from '../../models/Order.js';
import { Payment } from '../../models/Payment.js';
import { Shipment } from '../../models/Shipment.js';
import { Return } from '../../models/Return.js';
import { Refund } from '../../models/Refund.js';
import { transitionOrderStatus, cancelOrder } from '../../services/order.service.js';
import { createAuditLog } from '../../services/audit.service.js';
import { enqueueShipment } from '../../queues/index.js';
import { sendSuccess, sendPaginated } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';

/**
 * List all orders (admin) with filters and pagination.
 */
export async function listOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};

    if (req.query.status) query.status = req.query.status;
    if (req.query.userId) query.userId = req.query.userId;
    if (req.query.orderNumber) query.orderNumber = { $regex: req.query.orderNumber, $options: 'i' };

    // Date range filters
    if (req.query.from || req.query.to) {
      query.createdAt = {};
      if (req.query.from) (query.createdAt as Record<string, unknown>)['$gte'] = new Date(req.query.from as string);
      if (req.query.to) (query.createdAt as Record<string, unknown>)['$lte'] = new Date(req.query.to as string);
    }

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'email firstName lastName')
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
 * Get single order detail (admin) with payment, shipment, returns, refunds.
 */
export async function getOrderById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;

    const order = await Order.findById(id)
      .populate('userId', 'email firstName lastName phone')
      .select('+adminNotes')
      .lean();

    if (!order) {
      throw ApiError.notFound('Order');
    }

    // Fetch related records in parallel
    const [payments, shipments, returns, refunds] = await Promise.all([
      Payment.find({ orderId: id }).lean(),
      Shipment.find({ orderId: id }).lean(),
      Return.find({ orderId: id }).lean(),
      Refund.find({ orderId: id }).lean(),
    ]);

    sendSuccess({
      res,
      data: {
        ...order,
        payments,
        shipments,
        returns,
        refunds,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update order status (admin).
 */
export async function updateOrderStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const { status, message } = req.body;

    await transitionOrderStatus(id, status as OrderStatus, (message as string) || `Status changed to ${status}`, req.user?.id);

    await createAuditLog({
      action: 'order.status_update',
      resource: 'Order',
      resourceId: id,
      details: { newStatus: status, message: message as string },
      req,
    });

    const updatedOrder = await Order.findById(id).lean();
    sendSuccess({ res, data: updatedOrder, message: `Order status updated to ${status}` });
  } catch (error) {
    next(error);
  }
}

/**
 * Cancel order (admin).
 */
export async function adminCancelOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const { reason } = req.body;

    await cancelOrder(id, (reason as string) || 'Cancelled by admin', req.user?.id);

    await createAuditLog({
      action: 'order.cancel',
      resource: 'Order',
      resourceId: id,
      details: { reason: reason as string },
      req,
    });

    sendSuccess({ res, message: 'Order cancelled successfully' });
  } catch (error) {
    next(error);
  }
}

/**
 * Add admin note to order.
 */
export async function addOrderNote(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const { note } = req.body;

    const order = await Order.findByIdAndUpdate(
      id,
      { adminNotes: note },
      { new: true },
    ).select('+adminNotes');

    if (!order) {
      throw ApiError.notFound('Order');
    }

    sendSuccess({ res, data: order, message: 'Note added' });
  } catch (error) {
    next(error);
  }
}

/**
 * Get dashboard stats (admin).
 */
export async function getDashboardStats(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Determine date range from query
    let fromDate = thirtyDaysAgo;
    const period = req.query.period as string;
    if (period === 'today') fromDate = todayStart;
    else if (period === '7d') fromDate = sevenDaysAgo;
    else if (period === '90d') fromDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    const dateFilter = { createdAt: { $gte: fromDate } };

    const [
      totalOrders,
      pendingOrders,
      paidOrders,
      cancelledOrders,
      revenueResult,
      todayOrders,
    ] = await Promise.all([
      Order.countDocuments(dateFilter),
      Order.countDocuments({ ...dateFilter, status: 'PENDING_PAYMENT' }),
      Order.countDocuments({ ...dateFilter, status: { $in: ['PAID', 'PROCESSING', 'READY_TO_SHIP', 'SHIPPED', 'DELIVERED'] } }),
      Order.countDocuments({ ...dateFilter, status: 'CANCELLED' }),
      Order.aggregate([
        { $match: { ...dateFilter, status: { $nin: ['CANCELLED', 'REFUNDED', 'PENDING_PAYMENT', 'PAYMENT_FAILED'] } } },
        { $group: { _id: null, total: { $sum: '$grandTotal' }, count: { $sum: 1 } } },
      ]),
      Order.countDocuments({ createdAt: { $gte: todayStart } }),
    ]);

    const revenue = revenueResult[0]?.total || 0;
    const paidCount = revenueResult[0]?.count || 0;
    const aov = paidCount > 0 ? Math.round(revenue / paidCount) : 0;

    sendSuccess({
      res,
      data: {
        period,
        totalOrders,
        pendingOrders,
        paidOrders,
        cancelledOrders,
        revenue,
        averageOrderValue: aov,
        todayOrders,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Manually trigger shipment creation in Shiprocket (Admin).
 */
export async function createShipment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    
    const order = await Order.findById(id);
    if (!order) {
      throw ApiError.notFound('Order');
    }

    if (order.status !== 'PAID' && order.status !== 'PROCESSING') {
      throw ApiError.badRequest('Order must be PAID or PROCESSING to create a shipment');
    }

    await enqueueShipment(id);

    await createAuditLog({
      action: 'order.shipment_trigger',
      resource: 'Order',
      resourceId: id,
      details: {},
      req,
    });

    sendSuccess({ res, message: 'Shipment creation queued successfully' });
  } catch (error) {
    next(error);
  }
}
