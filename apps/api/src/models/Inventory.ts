import mongoose, { Schema, type Document, type Types } from 'mongoose';

export type InventoryTransactionType =
  | 'PURCHASE'
  | 'RESERVATION'
  | 'RESERVATION_RELEASE'
  | 'ORDER_CONFIRMED'
  | 'ORDER_CANCELLED'
  | 'RETURN_RECEIVED'
  | 'MANUAL_ADJUSTMENT'
  | 'DAMAGED'
  | 'TRANSFER';

export interface IInventory extends Document {
  _id: Types.ObjectId;
  variantId: Types.ObjectId;
  available: number;
  reserved: number;
  committed: number;   // Successfully paid, pending shipment
  sold: number;
  returned: number;
  damaged: number;
  lowStockThreshold: number;
  trackInventory: boolean;
  allowBackorder: boolean;
  updatedAt: Date;
}

export interface IInventoryTransaction extends Document {
  _id: Types.ObjectId;
  variantId: Types.ObjectId;
  type: InventoryTransactionType;
  quantity: number;  // Positive = increase, negative = decrease
  previousAvailable: number;
  newAvailable: number;
  orderId?: Types.ObjectId;
  reason?: string;
  performedBy?: Types.ObjectId;  // Admin user who made the adjustment
  createdAt: Date;
}

const inventorySchema = new Schema<IInventory>(
  {
    variantId: {
      type: Schema.Types.ObjectId,
      ref: 'ProductVariant',
      required: true,
      unique: true,
      index: true,
    },
    available: { type: Number, required: true, default: 0, min: 0 },
    reserved: { type: Number, default: 0, min: 0 },
    committed: { type: Number, default: 0, min: 0 },
    sold: { type: Number, default: 0, min: 0 },
    returned: { type: Number, default: 0, min: 0 },
    damaged: { type: Number, default: 0, min: 0 },
    lowStockThreshold: { type: Number, default: 5, min: 0 },
    trackInventory: { type: Boolean, default: true },
    allowBackorder: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// Index for low-stock dashboard queries
inventorySchema.index({ available: 1, lowStockThreshold: 1 });

const inventoryTransactionSchema = new Schema<IInventoryTransaction>(
  {
    variantId: {
      type: Schema.Types.ObjectId,
      ref: 'ProductVariant',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'PURCHASE', 'RESERVATION', 'RESERVATION_RELEASE',
        'ORDER_CONFIRMED', 'ORDER_CANCELLED', 'RETURN_RECEIVED',
        'MANUAL_ADJUSTMENT', 'DAMAGED', 'TRANSFER',
      ],
      required: true,
      index: true,
    },
    quantity: { type: Number, required: true },
    previousAvailable: { type: Number, required: true },
    newAvailable: { type: Number, required: true },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
    reason: { type: String, trim: true },
    performedBy: { type: Schema.Types.ObjectId, ref: 'AdminUser' },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

inventoryTransactionSchema.index({ variantId: 1, createdAt: -1 });
inventoryTransactionSchema.index({ orderId: 1 });

export const Inventory = mongoose.model<IInventory>('Inventory', inventorySchema);
export const InventoryTransaction = mongoose.model<IInventoryTransaction>('InventoryTransaction', inventoryTransactionSchema);
