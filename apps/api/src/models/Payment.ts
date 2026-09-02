import mongoose, { Schema, type Document, type Types } from 'mongoose';

export type PaymentStatus =
  | 'CREATED' | 'PENDING' | 'AUTHORIZED' | 'CAPTURED'
  | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED' | 'DISPUTED';

export interface IPayment extends Document {
  _id: Types.ObjectId;
  orderId: Types.ObjectId;
  userId: Types.ObjectId;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider: string; // 'razorpay', 'cod', etc.
  // Razorpay-specific
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  // Method
  method?: string;   // card, upi, netbanking, wallet, etc.
  // Metadata
  failureReason?: string;
  attempts: number;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },
    status: {
      type: String,
      enum: [
        'CREATED', 'PENDING', 'AUTHORIZED', 'CAPTURED',
        'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED', 'DISPUTED',
      ],
      default: 'CREATED',
      index: true,
    },
    provider: { type: String, required: true, default: 'razorpay' },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String, sparse: true, index: true },
    razorpaySignature: { type: String, select: false },
    method: { type: String },
    failureReason: { type: String },
    attempts: { type: Number, default: 0 },
    paidAt: { type: Date },
  },
  { timestamps: true },
);

paymentSchema.index({ razorpayOrderId: 1 }, { unique: true, sparse: true });

export const Payment = mongoose.model<IPayment>('Payment', paymentSchema);
