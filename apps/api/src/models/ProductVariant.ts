import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IVariantAttribute {
  name: string;   // Denormalized for fast reads (e.g., "Color")
  value: string;  // e.g., "Black"
}

export interface IProductVariant extends Document {
  _id: Types.ObjectId;
  productId: Types.ObjectId;
  sku: string;
  barcode?: string;
  attributes: IVariantAttribute[];
  price: number;           // Selling price in INR (paise or whole rupees — we use whole rupees)
  compareAtPrice?: number; // Original/MRP price for showing discount
  salePrice?: number;      // Flash sale price
  costPrice?: number;      // Cost to business (admin-only)
  weight?: number;         // grams
  dimensions?: {
    length?: number; // cm
    width?: number;
    height?: number;
  };
  images: string[];
  isActive: boolean;
  isPurchasable: boolean;  // Can be false for display-only variants
  sortOrder: number;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const variantAttributeSchema = new Schema<IVariantAttribute>(
  {
    name: { type: String, required: true },
    value: { type: String, required: true },
  },
  { _id: false },
);

const productVariantSchema = new Schema<IProductVariant>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    barcode: { type: String, sparse: true, trim: true },
    attributes: [variantAttributeSchema],
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    salePrice: { type: Number, min: 0 },
    costPrice: { type: Number, min: 0, select: false }, // Hidden from public API
    weight: { type: Number, min: 0 },
    dimensions: {
      length: { type: Number, min: 0 },
      width: { type: Number, min: 0 },
      height: { type: Number, min: 0 },
    },
    images: [{ type: String }],
    isActive: { type: Boolean, default: true },
    isPurchasable: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  },
);

// Compound indexes for common queries
productVariantSchema.index({ productId: 1, isActive: 1, deletedAt: 1 });
productVariantSchema.index({ productId: 1, 'attributes.name': 1, 'attributes.value': 1 });

export const ProductVariant = mongoose.model<IProductVariant>('ProductVariant', productVariantSchema);
