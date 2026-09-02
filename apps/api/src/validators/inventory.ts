import { z } from 'zod';

export const adjustInventorySchema = z.object({
  type: z.enum([
    'MANUAL_ADJUSTMENT',
    'DAMAGED',
    'RETURN_RECEIVED',
    'PURCHASE'
  ]),
  quantity: z.number().int().refine(val => val !== 0, {
    message: 'Quantity must not be zero',
  }),
  reason: z.string().optional(),
});
