import { Queue } from 'bullmq';
import { env } from '../config/env.js';

const connection = {
  url: env.REDIS_URL,
};

// Shipping Queue
export const shippingQueue = new Queue('shipping-jobs', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

// Helper function to enqueue shipping job
export async function enqueueShipment(orderId: string) {
  await shippingQueue.add('create-shiprocket-order', { orderId });
}

// Helper function to enqueue pickup request
export async function enqueuePickup(shipmentId: string) {
  await shippingQueue.add('request-pickup', { shipmentId });
}

// Helper function to enqueue Shiprocket order cancellation
export async function enqueueCancelShiprocket(orderId: string) {
  await shippingQueue.add('cancel-shiprocket-order', { orderId });
}
