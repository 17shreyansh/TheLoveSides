import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IWebhookEvent extends Document {
  _id: Types.ObjectId;
  provider: string;       // 'razorpay', 'shiprocket'
  eventType: string;      // 'payment.captured', 'shipment.delivered', etc.
  payload: Record<string, unknown>;
  signature?: string;
  status: 'received' | 'processed' | 'failed' | 'ignored';
  errorMessage?: string;
  attempts: number;
  processedAt?: Date;
  createdAt: Date;
}

const webhookEventSchema = new Schema<IWebhookEvent>(
  {
    provider: { type: String, required: true, index: true },
    eventType: { type: String, required: true, index: true },
    payload: { type: Schema.Types.Mixed, required: true },
    signature: { type: String, select: false },
    status: {
      type: String,
      enum: ['received', 'processed', 'failed', 'ignored'],
      default: 'received',
      index: true,
    },
    errorMessage: { type: String },
    attempts: { type: Number, default: 1 },
    processedAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

webhookEventSchema.index({ createdAt: -1 });
webhookEventSchema.index({ provider: 1, eventType: 1, createdAt: -1 });

export const WebhookEvent = mongoose.model<IWebhookEvent>('WebhookEvent', webhookEventSchema);
