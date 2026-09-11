import { Worker, type Job } from 'bullmq';
import { env } from '../config/env.js';
import { Order } from '../models/Order.js';
import { Shipment } from '../models/Shipment.js';
import { User } from '../models/User.js';
import {
  createShiprocketOrder,
  requestPickup,
  cancelShiprocketOrder,
} from '../integrations/shiprocket/shiprocket.service.js';
import { transitionOrderStatus } from '../services/order.service.js';
import { logger } from '../utils/logger.js';
import mongoose from 'mongoose';

const connection = {
  url: env.REDIS_URL,
};

export const shippingWorker = new Worker('shipping-jobs', async (job: Job) => {
  logger.info({ jobId: job.id, jobName: job.name, data: job.data }, 'Processing shipping job');
  
  switch (job.name) {
    case 'create-shiprocket-order':
      await handleCreateShiprocketOrder(job);
      break;

    case 'request-pickup':
      await handleRequestPickup(job);
      break;

    case 'cancel-shiprocket-order':
      await handleCancelShiprocketOrder(job);
      break;

    default:
      logger.warn({ jobName: job.name }, 'Unknown shipping job type');
  }
}, { 
  connection,
  // concurrency: 5 // adjust as needed
});

/**
 * Create a Shiprocket order for a paid order.
 */
async function handleCreateShiprocketOrder(job: Job): Promise<void> {
  const { orderId } = job.data;

  if (!mongoose.isValidObjectId(orderId)) {
    throw new Error('Invalid order ID');
  }

  const order = await Order.findById(orderId);
  
  if (!order) {
    throw new Error(`Order not found: ${orderId}`);
  }

  if (order.status !== 'PAID' && order.status !== 'PROCESSING') {
    logger.warn({ orderId, status: order.status }, 'Order is not in a shippable state (PAID/PROCESSING)');
    return;
  }

  const user = await User.findById(order.userId);
  if (!user) {
    throw new Error(`User not found for order: ${orderId}`);
  }

  // Call Shiprocket
  const shiprocketResponse = await createShiprocketOrder(order, user.email);

  // Save Shipment record
  await Shipment.create({
    orderId: order._id,
    shiprocketOrderId: shiprocketResponse.order_id.toString(),
    shiprocketShipmentId: shiprocketResponse.shipment_id.toString(),
    status: 'CREATED',
    awbCode: shiprocketResponse.awb_code || null,
    courierName: shiprocketResponse.courier_name || null,
    courierId: shiprocketResponse.courier_company_id
      ? parseInt(shiprocketResponse.courier_company_id)
      : undefined,
  });

  // Update order status to PROCESSING
  await transitionOrderStatus(
    order.id,
    'PROCESSING',
    `Shipment created at Shiprocket (Order ID: ${shiprocketResponse.order_id})`
  );

  logger.info({ orderId }, 'Shiprocket order created successfully');
}

/**
 * Schedule a pickup for a shipment via Shiprocket.
 */
async function handleRequestPickup(job: Job): Promise<void> {
  const { shipmentId } = job.data;

  if (!mongoose.isValidObjectId(shipmentId)) {
    throw new Error('Invalid shipment ID');
  }

  const shipment = await Shipment.findById(shipmentId);
  if (!shipment) {
    throw new Error(`Shipment not found: ${shipmentId}`);
  }

  if (!shipment.shiprocketShipmentId) {
    throw new Error(`Shipment ${shipmentId} has no Shiprocket shipment ID`);
  }

  await requestPickup(parseInt(shipment.shiprocketShipmentId));

  logger.info({ shipmentId, shiprocketShipmentId: shipment.shiprocketShipmentId }, 'Pickup requested');
}

/**
 * Cancel a Shiprocket order when an order is cancelled locally.
 */
async function handleCancelShiprocketOrder(job: Job): Promise<void> {
  const { orderId } = job.data;

  if (!mongoose.isValidObjectId(orderId)) {
    throw new Error('Invalid order ID');
  }

  // Find all shipments for this order that have Shiprocket order IDs
  const shipments = await Shipment.find({
    orderId,
    shiprocketOrderId: { $exists: true, $ne: null },
    status: { $nin: ['CANCELLED', 'DELIVERED'] },
  });

  if (shipments.length === 0) {
    logger.info({ orderId }, 'No active Shiprocket shipments to cancel');
    return;
  }

  const shiprocketOrderIds = shipments
    .map(s => parseInt(s.shiprocketOrderId!))
    .filter(id => !isNaN(id));

  if (shiprocketOrderIds.length > 0) {
    await cancelShiprocketOrder(shiprocketOrderIds);

    // Update local shipment statuses
    await Shipment.updateMany(
      { orderId, shiprocketOrderId: { $in: shipments.map(s => s.shiprocketOrderId) } },
      { status: 'CANCELLED' },
    );

    logger.info({ orderId, shiprocketOrderIds }, 'Shiprocket orders cancelled');
  }
}

shippingWorker.on('completed', (job) => {
  logger.info({ jobId: job.id, jobName: job.name }, 'Shipping job completed');
});

shippingWorker.on('failed', (job, err) => {
  logger.error({ jobId: job?.id, jobName: job?.name, err }, 'Shipping job failed');
});
