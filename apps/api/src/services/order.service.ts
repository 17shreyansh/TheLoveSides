import mongoose from 'mongoose';
import { Order, type OrderStatus, type IOrderTimeline } from '../models/Order.js';
import { Cart } from '../models/Cart.js';
import { CouponUsage } from '../models/Coupon.js';
import { Coupon } from '../models/Coupon.js';
import { enqueueShipment } from '../queues/index.js';
import { generateOrderNumber } from '../utils/orderNumber.js';
import { calculateCartPricing, validateCartInventory, type CartPricing } from './pricing.service.js';
import { reserveInventory, releaseReservation, confirmReservation } from './inventory.service.js';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';

/**
 * Valid order status transitions. Prevents invalid state changes.
 */
const VALID_TRANSITIONS: Record<string, OrderStatus[]> = {
  PENDING_PAYMENT: ['PAID', 'PAYMENT_FAILED', 'CANCELLED'],
  PAYMENT_FAILED: ['PENDING_PAYMENT', 'CANCELLED'],
  PAID: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['READY_TO_SHIP', 'CANCELLED'],
  READY_TO_SHIP: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['OUT_FOR_DELIVERY', 'RTO'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'RTO'],
  DELIVERED: ['RETURN_REQUESTED'],
  RETURN_REQUESTED: ['RETURNED', 'DELIVERED'],
  RETURNED: ['REFUNDED'],
  CANCELLED: [],
  REFUNDED: [],
  RTO: [],
};

interface CreateOrderInput {
  userId: string;
  shippingAddress: any;
  billingAddress?: any;
  couponCode?: string;
  customerNotes?: string;
  idempotencyKey?: string;
}

/**
 * Creates an order from the user's cart with full inventory reservation.
 *
 * Flow:
 * 1. Fetch & validate cart
 * 2. Calculate server-side pricing
 * 3. Validate inventory
 * 4. Generate order number
 * 5. Create order with PENDING_PAYMENT status
 * 6. Reserve inventory atomically
 * 7. Record coupon usage
 *
 * Returns the created order.
 */
export async function createOrderFromCart(input: CreateOrderInput) {
  // Idempotency check
  if (input.idempotencyKey) {
    const existing = await Order.findOne({ idempotencyKey: input.idempotencyKey }).lean();
    if (existing) {
      logger.info({ idempotencyKey: input.idempotencyKey }, 'Duplicate order creation prevented');
      return existing;
    }
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Fetch cart
    const cart = await Cart.findOne({ userId: input.userId }).session(session);
    if (!cart || !cart.items || cart.items.length === 0) {
      throw ApiError.badRequest('Cart is empty');
    }

    // 2. Validate inventory
    await validateCartInventory(cart.items);

    // 3. Calculate server-side pricing
    const pricing: CartPricing = await calculateCartPricing(
      cart.items,
      input.couponCode || cart.couponCode || undefined,
      input.userId,
    );

    if (pricing.items.length === 0) {
      throw ApiError.badRequest('No purchasable items in cart');
    }

    // 4. Generate order number
    const orderNumber = await generateOrderNumber();

    // 5. Build order item snapshots
    const orderItems = pricing.items.map((item) => ({
      productId: new mongoose.Types.ObjectId(item.variantId.split('').length ? item.productId : item.productId),
      variantId: new mongoose.Types.ObjectId(item.variantId),
      name: item.name,
      sku: item.sku,
      image: item.image,
      attributes: item.attributes,
      price: item.unitPrice,
      quantity: item.quantity,
      tax: item.tax,
      discount: item.discount,
      total: item.total,
    }));

    // 6. Build address with correct field names
    const shippingAddress = {
      fullName: `${input.shippingAddress.firstName} ${input.shippingAddress.lastName}`.trim(),
      phone: input.shippingAddress.phone,
      addressLine1: input.shippingAddress.addressLine1,
      addressLine2: input.shippingAddress.addressLine2,
      city: input.shippingAddress.city,
      state: input.shippingAddress.state,
      pincode: input.shippingAddress.postalCode || input.shippingAddress.pincode,
      country: input.shippingAddress.country || 'India',
      landmark: input.shippingAddress.landmark,
    };

    const billingAddress = input.billingAddress
      ? {
          fullName: `${input.billingAddress.firstName} ${input.billingAddress.lastName}`.trim(),
          phone: input.billingAddress.phone,
          addressLine1: input.billingAddress.addressLine1,
          addressLine2: input.billingAddress.addressLine2,
          city: input.billingAddress.city,
          state: input.billingAddress.state,
          pincode: input.billingAddress.postalCode || input.billingAddress.pincode,
          country: input.billingAddress.country || 'India',
          landmark: input.billingAddress.landmark,
        }
      : shippingAddress;

    // 7. Create order
    const [order] = await Order.create([{
      orderNumber,
      userId: input.userId,
      items: orderItems,
      shippingAddress,
      billingAddress,
      subtotal: pricing.subtotal,
      discountAmount: pricing.discountAmount,
      couponCode: pricing.couponCode,
      taxAmount: pricing.taxAmount,
      shippingAmount: pricing.shippingAmount,
      grandTotal: pricing.grandTotal,
      currency: 'INR',
      status: 'PENDING_PAYMENT' as OrderStatus,
      timeline: [{
        status: 'PENDING_PAYMENT',
        message: 'Order created, awaiting payment',
        timestamp: new Date(),
      }],
      customerNotes: input.customerNotes,
      idempotencyKey: input.idempotencyKey,
    }], { session });

    // 8. Reserve inventory atomically
    const reservationItems = pricing.items.map((item) => ({
      variantId: item.variantId,
      quantity: item.quantity,
    }));

    await reserveInventory(reservationItems, order._id.toString(), session);

    // 9. Record coupon usage
    if (pricing.couponCode) {
      await Coupon.findOneAndUpdate(
        { code: pricing.couponCode },
        { $inc: { usedCount: 1 } },
        { session },
      );

      await CouponUsage.create([{
        couponId: (await Coupon.findOne({ code: pricing.couponCode }).session(session).lean())?._id,
        userId: input.userId,
        orderId: order._id,
      }], { session });
    }

    await session.commitTransaction();

    logger.info({
      orderId: order._id,
      orderNumber,
      userId: input.userId,
      grandTotal: pricing.grandTotal,
    }, 'Order created successfully');

    return order;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

/**
 * Transitions an order to a new status with validation.
 */
export async function transitionOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  message: string,
  performedBy?: string,
): Promise<void> {
  const order = await Order.findById(orderId);
  if (!order) {
    throw ApiError.notFound('Order');
  }

  const allowedTransitions = VALID_TRANSITIONS[order.status];
  if (!allowedTransitions || !allowedTransitions.includes(newStatus)) {
    throw ApiError.badRequest(
      `Cannot transition from ${order.status} to ${newStatus}`,
      'INVALID_STATUS_TRANSITION',
    );
  }

  const timelineEntry: IOrderTimeline = {
    status: newStatus,
    message,
    timestamp: new Date(),
    performedBy: performedBy ? new mongoose.Types.ObjectId(performedBy) : undefined,
  } as IOrderTimeline;

  const updateFields: Record<string, unknown> = {
    status: newStatus,
    $push: { timeline: timelineEntry },
  };

  // Set timestamp fields based on status
  if (newStatus === 'PAID') {
    updateFields.paidAt = new Date();
    await enqueueShipment(order.id).catch(err => {
      logger.error({ err, orderId: order.id }, 'Failed to enqueue shipment job');
    });
  }
  if (newStatus === 'SHIPPED') updateFields.shippedAt = new Date();
  if (newStatus === 'DELIVERED') updateFields.deliveredAt = new Date();
  if (newStatus === 'CANCELLED') {
    updateFields.cancelledAt = new Date();
  }

  await Order.findByIdAndUpdate(orderId, updateFields);

  // Side effects based on status change
  if (newStatus === 'CANCELLED') {
    // Release inventory reservation
    const items = order.items.map((item) => ({
      variantId: item.variantId.toString(),
      quantity: item.quantity,
    }));
    await releaseReservation(items, orderId);
  }

  if (newStatus === 'PAID') {
    // Confirm inventory (move reserved → committed)
    const items = order.items.map((item) => ({
      variantId: item.variantId.toString(),
      quantity: item.quantity,
    }));
    await confirmReservation(items, orderId);
  }

  logger.info({ orderId, from: order.status, to: newStatus }, 'Order status transitioned');
}

/**
 * Cancel an order. Only allowed before shipment.
 */
export async function cancelOrder(
  orderId: string,
  reason: string,
  performedBy?: string,
): Promise<void> {
  const order = await Order.findById(orderId);
  if (!order) {
    throw ApiError.notFound('Order');
  }

  const cancellableStatuses: OrderStatus[] = [
    'PENDING_PAYMENT', 'PAYMENT_FAILED', 'PAID', 'PROCESSING',
  ];

  if (!cancellableStatuses.includes(order.status)) {
    throw ApiError.badRequest(
      `Cannot cancel order in ${order.status} status`,
      'ORDER_NOT_CANCELLABLE',
    );
  }

  order.status = 'CANCELLED';
  order.cancelledAt = new Date();
  order.cancellationReason = reason;
  order.timeline.push({
    status: 'CANCELLED',
    message: `Order cancelled: ${reason}`,
    timestamp: new Date(),
    performedBy: performedBy ? new mongoose.Types.ObjectId(performedBy) : undefined,
  } as IOrderTimeline);

  await order.save();

  // Release inventory
  const items = order.items.map((item) => ({
    variantId: item.variantId.toString(),
    quantity: item.quantity,
  }));
  await releaseReservation(items, orderId);

  logger.info({ orderId, reason }, 'Order cancelled');
}
