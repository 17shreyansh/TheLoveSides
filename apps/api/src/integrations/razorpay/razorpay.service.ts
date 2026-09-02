import crypto from 'node:crypto';
import { getRazorpayClient } from './client.js';
import { env } from '../../config/env.js';
import { ApiError } from '../../utils/ApiError.js';
import { logger } from '../../utils/logger.js';

interface CreatePaymentOrderParams {
  amount: number; // In base currency (e.g., INR)
  receiptId: string;
  notes?: Record<string, string>;
}

/**
 * Creates a Razorpay order.
 * Amount is multiplied by 100 to convert to paise.
 */
export async function createPaymentOrder({ amount, receiptId, notes }: CreatePaymentOrderParams) {
  try {
    const razorpay = getRazorpayClient();
    
    const options = {
      amount: Math.round(amount * 100), // convert to paise
      currency: 'INR',
      receipt: receiptId,
      notes: notes || {},
    };

    const order = await razorpay.orders.create(options);
    return order;
  } catch (error) {
    logger.error({ err: error, receiptId }, 'Failed to create Razorpay order');
    throw ApiError.internal('Payment gateway error');
  }
}

/**
 * Verifies the payment signature sent by frontend or webhook.
 */
export function verifyPaymentSignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  signature: string
): boolean {
  try {
    if (!env.RAZORPAY_KEY_SECRET) return false;

    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    return expectedSignature === signature;
  } catch (error) {
    logger.error({ err: error }, 'Signature verification failed');
    return false;
  }
}

/**
 * Verifies a webhook signature from Razorpay.
 */
export function verifyWebhookSignature(payload: string, signature: string): boolean {
  try {
    if (!env.RAZORPAY_WEBHOOK_SECRET) return false;

    const expectedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
      .update(payload)
      .digest('hex');

    return expectedSignature === signature;
  } catch (error) {
    logger.error({ err: error }, 'Webhook signature verification failed');
    return false;
  }
}

/**
 * Initiates a refund for a payment.
 */
export async function initiateRefund(paymentId: string, amount?: number, notes?: Record<string, string>) {
  try {
    const razorpay = getRazorpayClient();
    
    const options: Record<string, any> = {
      notes: notes || {},
    };
    
    // If amount is provided, partial refund. Else full refund.
    if (amount) {
      options.amount = Math.round(amount * 100);
    }

    const refund = await razorpay.payments.refund(paymentId, options);
    return refund;
  } catch (error) {
    logger.error({ err: error, paymentId }, 'Failed to initiate refund');
    throw ApiError.internal('Refund failed at gateway');
  }
}
