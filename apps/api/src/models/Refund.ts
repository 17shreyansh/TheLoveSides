import mongoose, { Schema, type Document, type Types } from 'mongoose';

export type RefundStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface IRefund extends Document {
  _id: Types.ObjectId;
  orderId: Types.ObjectId;
  paymentId: Types.ObjectId;
  userId: Types.ObjectId;
  amount: number;
  currency: string;
  reason: string;
  status: RefundStatus;
  razorpayRefundId?: string;
  isPartial: boolean;
  failureReason?: string;
  initiatedBy: Types.ObjectId; // Admin who initiated
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const refundSchema = new Schema<IRefund>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    paymentId: { type: Schema.Types.ObjectId, ref: 'Payment', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },
    reason: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'],
      default: 'PENDING',
      index: true,
    },
    razorpayRefundId: { type: String, sparse: true },
    isPartial: { type: Boolean, default: false },
    failureReason: { type: String },
    initiatedBy: { type: Schema.Types.ObjectId, ref: 'AdminUser', required: true },
    processedAt: { type: Date },
  },
  { timestamps: true },
);

export const Refund = mongoose.model<IRefund>('Refund', refundSchema);
