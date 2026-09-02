import mongoose, { Schema, type Document, type Types } from 'mongoose';

export type CouponType = 'fixed' | 'percentage';

export interface ICoupon extends Document {
  _id: Types.ObjectId;
  code: string;
  type: CouponType;
  value: number;             // Amount in INR (fixed) or percentage
  minCartValue?: number;
  maxDiscountAmount?: number; // Cap for percentage coupons
  // Scope
    applicableProductIds: Types.ObjectId[];
    applicableCollectionIds: Types.ObjectId[];
  applicableUserIds: Types.ObjectId[]; // User-specific coupons
  isFirstOrderOnly: boolean;
  // Limits
  usageLimit?: number;        // Total usage across all users
  perUserLimit: number;       // Max uses per user
  usedCount: number;
  // Validity
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const couponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['fixed', 'percentage'],
      required: true,
    },
    value: { type: Number, required: true, min: 0 },
    minCartValue: { type: Number, min: 0 },
    maxDiscountAmount: { type: Number, min: 0 },
    applicableProductIds: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    applicableCollectionIds: [{ type: Schema.Types.ObjectId, ref: 'Collection' }],
    applicableUserIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    isFirstOrderOnly: { type: Boolean, default: false },
    usageLimit: { type: Number, min: 0 },
    perUserLimit: { type: Number, default: 1, min: 1 },
    usedCount: { type: Number, default: 0, min: 0 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Coupon = mongoose.model<ICoupon>('Coupon', couponSchema);

// Track individual coupon usages for per-user limit enforcement
export interface ICouponUsage extends Document {
  couponId: Types.ObjectId;
  userId: Types.ObjectId;
  orderId: Types.ObjectId;
  createdAt: Date;
}

const couponUsageSchema = new Schema<ICouponUsage>(
  {
    couponId: { type: Schema.Types.ObjectId, ref: 'Coupon', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

couponUsageSchema.index({ couponId: 1, userId: 1 });

export const CouponUsage = mongoose.model<ICouponUsage>('CouponUsage', couponUsageSchema);
