import type { Request, Response, NextFunction } from 'express';
import { Order } from '../../models/Order.js';
import { Return } from '../../models/Return.js';
import { sendSuccess } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';

/**
 * Customer requests a return for specific items in an order.
 */
export async function requestReturn(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { orderId } = req.params;
    const { variantId, quantity, reason, notes, images } = req.body;

    const order = await Order.findOne({ _id: orderId, userId: req.user!.id });
    
    if (!order) {
      throw ApiError.notFound('Order not found');
    }

    // Only delivered orders can be returned (typically)
    if (order.status !== 'DELIVERED') {
      throw ApiError.badRequest('Only delivered orders can be returned');
    }

    // Check if the item exists in the order and the quantity is valid
    const orderItem = order.items.find(item => item.variantId.toString() === variantId);
    if (!orderItem) {
      throw ApiError.badRequest('Item not found in this order');
    }

    if (quantity > orderItem.quantity) {
      throw ApiError.badRequest('Return quantity exceeds ordered quantity');
    }

    // Check if a return already exists for this variant
    const existingReturn = await Return.findOne({ orderId, variantId });
    if (existingReturn && !['REJECTED', 'CLOSED'].includes(existingReturn.status)) {
      throw ApiError.badRequest('A return request already exists for this item');
    }

    const returnRequest = await Return.create({
      orderId,
      userId: req.user!.id,
      variantId,
      quantity,
      reason,
      notes,
      images: images || [],
    });

    sendSuccess({ res, data: returnRequest, message: 'Return requested successfully', statusCode: 201 });
  } catch (error) {
    next(error);
  }
}
