import Razorpay from 'razorpay';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';

export const isRazorpayConfigured = Boolean(env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET);

// We export a function to get the client so we can throw early if not configured when actually needed
export function getRazorpayClient() {
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    logger.error('Razorpay credentials missing');
    throw new Error('Payment gateway not configured');
  }

  return new Razorpay({
    key_id: env.RAZORPAY_KEY_ID,
    key_secret: env.RAZORPAY_KEY_SECRET,
  });
}
