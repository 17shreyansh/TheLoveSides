import type { Request, Response, NextFunction } from 'express';
import { ApiError } from '../../utils/ApiError.js';
import { sendSuccess } from '../../utils/ApiResponse.js';
import { createOrderFromCart } from '../../services/order.service.js';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../../models/User.js';
import { Role } from '../../models/Role.js';
import { hashPassword } from '../../utils/password.js';

/**
 * Initiates checkout by converting a Cart to a pending Order.
 *
 * Flow:
 * 1. Validates cart has items
 * 2. Recalculates pricing server-side
 * 3. Validates inventory (atomic reservation)
 * 4. Creates order with PENDING_PAYMENT status
 * 5. Returns order ID for payment initiation
 *
 * The cart is NOT deleted at this point — only after payment succeeds.
 */
export async function initiateCheckout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, shippingAddress, billingAddress, couponCode, customerNotes } = req.body;

    let userId = req.user?.id;

    if (!userId) {
      if (!email) {
        throw ApiError.badRequest('Email is required for guest checkout');
      }
      
      // Auto-create or find user for guest checkout
      let user = await User.findOne({ email });
      if (!user) {
        const customerRole = await Role.findOne({ name: 'Customer' });
        const randomPassword = await hashPassword(uuidv4());
        
        user = await User.create({
          email,
          passwordHash: randomPassword,
          firstName: shippingAddress?.firstName || 'Guest',
          lastName: shippingAddress?.lastName || 'User',
          role: customerRole?._id,
        });
      }
      userId = user.id;
    }

    // Generate idempotency key to prevent duplicate orders from double-clicks
    const idempotencyKey = req.headers['x-idempotency-key'] as string || uuidv4();

    const order = await createOrderFromCart({
      userId: userId,
      shippingAddress,
      billingAddress,
      couponCode,
      customerNotes,
      idempotencyKey,
    });

    sendSuccess({
      res,
      statusCode: 201,
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        grandTotal: order.grandTotal,
        currency: order.currency,
      },
      message: 'Order created. Proceed to payment.',
    });
  } catch (error) {
    next(error);
  }
}
