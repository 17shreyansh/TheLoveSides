import mongoose, { Schema, type Document, type Types } from 'mongoose';

export type ReturnStatus =
  | 'REQUESTED' | 'APPROVED' | 'REJECTED'
  | 'PICKUP_SCHEDULED' | 'PICKED_UP' | 'RECEIVED'
  | 'QC_PENDING' | 'QC_PASSED' | 'QC_FAILED'
  | 'REFUND_PENDING' | 'REFUNDED' | 'CLOSED';

export interface IReturn extends Document {
  _id: Types.ObjectId;
  orderId: Types.ObjectId;
  userId: Types.ObjectId;
  variantId: Types.ObjectId;
  quantity: number;
  reason: string;
  notes?: string;
  images: string[];
  status: ReturnStatus;
  adminNotes?: string;
  shiprocketReturnId?: string;
  refundId?: Types.ObjectId;
  requestedAt: Date;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const returnSchema = new Schema<IReturn>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    variantId: { type: Schema.Types.ObjectId, ref: 'ProductVariant', required: true },
    quantity: { type: Number, required: true, min: 1 },
    reason: { type: String, required: true, trim: true },
    notes: { type: String, trim: true },
    images: [{ type: String }],
    status: {
      type: String,
      enum: [
        'REQUESTED', 'APPROVED', 'REJECTED',
        'PICKUP_SCHEDULED', 'PICKED_UP', 'RECEIVED',
        'QC_PENDING', 'QC_PASSED', 'QC_FAILED',
        'REFUND_PENDING', 'REFUNDED', 'CLOSED',
      ],
      default: 'REQUESTED',
      index: true,
    },
    adminNotes: { type: String, trim: true },
    shiprocketReturnId: { type: String },
    refundId: { type: Schema.Types.ObjectId, ref: 'Refund' },
    requestedAt: { type: Date, default: Date.now },
    resolvedAt: { type: Date },
  },
  { timestamps: true },
);

export const Return = mongoose.model<IReturn>('Return', returnSchema);
