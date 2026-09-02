import { z } from 'zod';

export const addToCartSchema = z.object({
  productId: z.string().length(24),
  variantId: z.string().length(24),
  quantity: z.number().int().min(1).default(1),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(1),
});

export const applyCouponSchema = z.object({
  code: z.string().min(1),
});
