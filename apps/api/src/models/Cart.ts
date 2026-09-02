import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface ICartItem {
  variantId: Types.ObjectId;
  productId: Types.ObjectId;
  quantity: number;
  // Snapshot fields for display (denormalized for performance)
  name: string;
  sku: string;
  price: number;
  image?: string;
  attributes: { name: string; value: string }[];
  addedAt: Date;
}

export interface ICart extends Document {
  _id: Types.ObjectId;
  userId?: Types.ObjectId;       // null for guest carts
  guestId?: string;              // Secure guest cart identifier
  items: ICartItem[];
  couponCode?: string;
  expiresAt?: Date;              // Guest carts expire
  createdAt: Date;
  updatedAt: Date;
}

const cartItemSchema = new Schema<ICartItem>(
  {
    variantId: { type: Schema.Types.ObjectId, ref: 'ProductVariant', required: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    name: { type: String, required: true },
    sku: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    image: { type: String },
    attributes: [{
      name: { type: String, required: true },
      value: { type: String, required: true },
      _id: false,
    }],
    addedAt: { type: Date, default: Date.now },
  },
  { _id: true },
);

const cartSchema = new Schema<ICart>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    guestId: {
      type: String,
    },
    items: [cartItemSchema],
    couponCode: { type: String, trim: true },
    expiresAt: {
      type: Date,
      index: { expireAfterSeconds: 0 }, // TTL index — MongoDB auto-deletes expired docs
    },
  },
  { timestamps: true },
);

// Only one cart per user or guest
cartSchema.index({ userId: 1 }, { unique: true, sparse: true });
cartSchema.index({ guestId: 1 }, { unique: true, sparse: true });

export const Cart = mongoose.model<ICart>('Cart', cartSchema);
