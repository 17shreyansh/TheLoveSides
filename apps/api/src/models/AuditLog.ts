import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IAuditLog extends Document {
  _id: Types.ObjectId;
  action: string;
  resource: string;
  resourceId?: string;
  adminId: Types.ObjectId;
  adminEmail: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    action: { type: String, required: true, index: true },  // e.g., 'product.update', 'order.cancel'
    resource: { type: String, required: true, index: true }, // e.g., 'Product', 'Order'
    resourceId: { type: String },
    adminId: { type: Schema.Types.ObjectId, ref: 'AdminUser', required: true, index: true },
    adminEmail: { type: String, required: true },
    details: { type: Schema.Types.Mixed },
    ipAddress: { type: String },
    userAgent: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ resource: 1, resourceId: 1, createdAt: -1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
