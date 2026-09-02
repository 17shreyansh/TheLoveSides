import type { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Order } from '../../models/Order.js';
import { Payment } from '../../models/Payment.js';
import { Cart } from '../../models/Cart.js';
import { createPaymentOrder, verifyPaymentSignature } from '../../integrations/razorpay/razorpay.service.js';
import { transitionOrderStatus } from '../../services/order.service.js';
import { sendSuccess } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';
import { logger } from '../../utils/logger.js';

/**
 * Creates a Razorpay Order ID for a pending order in our database.
 */
export async function createRazorpayOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { orderId } = req.params;

    // Verify ownership and status
    const query: any = { _id: orderId };
    if (req.user) query.userId = req.user.id;

    const order = await Order.findOne(query);

    if (!order) {
      throw ApiError.notFound('Order not found');
    }

    if (order.status !== 'PENDING_PAYMENT') {
      throw ApiError.badRequest('Order is not in pending state');
    }

    // Call Razorpay API
    const rpOrder = await createPaymentOrder({
      amount: order.grandTotal,
      receiptId: order.orderNumber,
      notes: { orderId: order.id, userId: order.userId.toString() },
    });

    // Update order with razorpayOrderId (we can store this in payment model later or just return it)
    sendSuccess({
      res,
      data: {
        id: rpOrder.id,
        amount: rpOrder.amount,
        currency: rpOrder.currency,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Verifies the payment signature returned by the frontend after a successful Razorpay checkout.
 */
export async function verifyPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { orderId } = req.params;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw ApiError.badRequest('Missing payment verification details');
    }

    // Verify ownership and status
    const query: any = { _id: orderId };
    if (req.user) query.userId = req.user.id;

    const order = await Order.findOne(query).session(session);

    if (!order) {
      throw ApiError.notFound('Order not found');
    }

    if (order.status !== 'PENDING_PAYMENT') {
      throw ApiError.badRequest('Order is not in pending state');
    }

    // Verify Signature
    const isValid = verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    
    if (!isValid) {
      logger.warn({ orderId, razorpay_payment_id }, 'Invalid payment signature received');
      throw ApiError.badRequest('Invalid payment signature');
    }

    // Record Payment
    await Payment.create([{
      orderId: order._id,
      userId: order.userId,
      amount: order.grandTotal,
      currency: 'INR',
      provider: 'RAZORPAY',
      providerPaymentId: razorpay_payment_id,
      providerOrderId: razorpay_order_id,
      razorpaySignature: razorpay_signature,
      status: 'CAPTURED',
      paymentMethod: 'ONLINE', // We can refine this via webhook later
    }], { session });

    // Transition Order Status to PAID (this also confirms inventory)
    // We cannot easily pass session to transitionOrderStatus currently, so we update here or commit first.
    // Actually, transitionOrderStatus does not accept a session.
    // Let's commit the transaction first, then call transitionOrderStatus to ensure it doesn't conflict.
    await session.commitTransaction();
    session.endSession();

    await transitionOrderStatus(
      order.id,
      'PAID',
      'Payment successful, order confirmed',
      order.userId.toString()
    );

    // Clear the cart since checkout is successful
    if (req.cartOwner) {
      await Cart.findOneAndUpdate(
        { 
          $or: [
            { userId: order.userId },
            { sessionId: req.cartOwner.id }
          ] 
        },
        { $set: { items: [], couponCode: null } }
      );
    }

    sendSuccess({ res, message: 'Payment verified and order confirmed' });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();
    next(error);
  }
}
