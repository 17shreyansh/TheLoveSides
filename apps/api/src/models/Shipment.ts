import mongoose, { Schema, type Document, type Types } from 'mongoose';

export type ShipmentStatus =
  | 'CREATED' | 'SHIPMENT_CREATED' | 'AWB_ASSIGNED' | 'PICKED_UP'
  | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED'
  | 'UNDELIVERED' | 'RTO' | 'CANCELLED' | 'LOST' | 'DAMAGED';

export interface IShipment extends Document {
  _id: Types.ObjectId;
  orderId: Types.ObjectId;
  // Shiprocket fields
  shiprocketOrderId?: string;
  shiprocketShipmentId?: string;
  awbCode?: string;
  courierId?: number;
  courierName?: string;
  trackingUrl?: string;
  // Status
  status: ShipmentStatus;
  // Dates
  pickupDate?: Date;
  estimatedDeliveryDate?: Date;
  deliveredAt?: Date;
  // Package
  weight?: number;
  dimensions?: { length?: number; width?: number; height?: number };
  // Label & Manifest
  labelUrl?: string;
  manifestUrl?: string;
  // History
  trackingHistory: {
    status: string;
    location?: string;
    timestamp: Date;
    description?: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const shipmentSchema = new Schema<IShipment>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    shiprocketOrderId: { type: String, sparse: true },
    shiprocketShipmentId: { type: String, sparse: true },
    awbCode: { type: String, sparse: true, index: true },
    courierId: { type: Number },
    courierName: { type: String },
    trackingUrl: { type: String },
    status: {
      type: String,
      enum: [
        'CREATED', 'SHIPMENT_CREATED', 'AWB_ASSIGNED', 'PICKED_UP',
        'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED',
        'UNDELIVERED', 'RTO', 'CANCELLED', 'LOST', 'DAMAGED',
      ],
      default: 'CREATED',
      index: true,
    },
    pickupDate: { type: Date },
    estimatedDeliveryDate: { type: Date },
    deliveredAt: { type: Date },
    weight: { type: Number },
    dimensions: {
      length: { type: Number },
      width: { type: Number },
      height: { type: Number },
    },
    labelUrl: { type: String },
    manifestUrl: { type: String },
    trackingHistory: [{
      status: { type: String, required: true },
      location: { type: String },
      timestamp: { type: Date, required: true },
      description: { type: String },
      _id: false,
    }],
  },
  { timestamps: true },
);

shipmentSchema.index({ orderId: 1 });

export const Shipment = mongoose.model<IShipment>('Shipment', shipmentSchema);
