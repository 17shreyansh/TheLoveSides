import { Worker, type Job } from 'bullmq';
import { env } from '../config/env.js';
import { Order } from '../models/Order.js';
import { Shipment } from '../models/Shipment.js';
import { User } from '../models/User.js';
import { createShiprocketOrder } from '../integrations/shiprocket/shiprocket.service.js';
import { transitionOrderStatus } from '../services/order.service.js';
import { logger } from '../utils/logger.js';
import mongoose from 'mongoose';

const connection = {
  url: env.REDIS_URL,
};

export const shippingWorker = new Worker('shipping-jobs', async (job: Job) => {
  logger.info({ jobId: job.id, data: job.data }, 'Processing shipping job');
  
  if (job.name === 'create-shiprocket-order') {
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
      provider: 'SHIPROCKET',
      providerShipmentId: shiprocketResponse.shipment_id.toString(),
      providerOrderId: shiprocketResponse.order_id.toString(),
      status: 'CREATED',
      awbCode: shiprocketResponse.awb_code || null,
      courierName: shiprocketResponse.courier_name || null,
    });

    // Update order status to PROCESSING or READY_TO_SHIP depending on your workflow
    await transitionOrderStatus(
      order.id,
      'PROCESSING',
      `Shipment created at Shiprocket (Order ID: ${shiprocketResponse.order_id})`
    );

    logger.info({ orderId }, 'Shiprocket order created successfully');
  }
}, { 
  connection,
  // concurrency: 5 // adjust as needed
});

shippingWorker.on('completed', (job) => {
  logger.info({ jobId: job.id }, 'Shipping job completed');
});

shippingWorker.on('failed', (job, err) => {
  logger.error({ jobId: job?.id, err }, 'Shipping job failed');
});
