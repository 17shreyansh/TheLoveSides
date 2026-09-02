import mongoose, { Schema, type Document, type Types } from 'mongoose';

export type ProductStatus = 'draft' | 'published' | 'archived';

export interface ISeoMetadata {
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  robots?: string;
  keywords?: string[];
}

export interface IProduct extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  skuPrefix?: string;
  shortDescription?: string;
  description?: string;
  highlights: string[];
  specifications?: string;
  brand?: string;
  roomIds: Types.ObjectId[];
  collectionIds: Types.ObjectId[];
  tags: string[];
  // Attributes are the variant-defining dimensions or generic properties (e.g., Color, Size)
  attributes: { name: string; values: string[] }[];
  images: string[];
  videos: string[];
  seo: ISeoMetadata;
  status: ProductStatus;
  isFeatured: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  publishedAt?: Date;
  // Tax
  taxRate?: number;
  hsnCode?: string;
  isTaxInclusive: boolean;
  // Shipping
  requiresShipping: boolean;
  // Return
  isReturnable: boolean;
  returnWindowDays: number;
  // Soft delete
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const seoSchema = new Schema<ISeoMetadata>(
  {
    metaTitle: { type: String, trim: true },
    metaDescription: { type: String, trim: true },
    canonicalUrl: { type: String, trim: true },
    ogTitle: { type: String, trim: true },
    ogDescription: { type: String, trim: true },
    ogImage: { type: String, trim: true },
    robots: { type: String, trim: true },
    keywords: [{ type: String }],
  },
  { _id: false },
);

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    skuPrefix: { type: String, trim: true, uppercase: true },
    shortDescription: { type: String, trim: true },
    description: { type: String }, // Rich text / HTML (sanitized)
    highlights: [{ type: String }],
    specifications: { type: String },
    brand: { type: String, trim: true },
    roomIds: [{
      type: Schema.Types.ObjectId,
      ref: 'Room',
      index: true,
    }],
    collectionIds: [{
      type: Schema.Types.ObjectId,
      ref: 'Collection',
      index: true,
    }],
    tags: [{ type: String, lowercase: true, trim: true }],
    attributes: [{
      name: { type: String, required: true },
      values: [{ type: String, required: true }]
    }],
    images: [{ type: String }],
    videos: [{ type: String }],
    seo: { type: seoSchema, default: () => ({}) },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
      index: true,
    },
    isFeatured: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    publishedAt: { type: Date },
    taxRate: { type: Number, min: 0, max: 100 },
    hsnCode: { type: String, trim: true },
    isTaxInclusive: { type: Boolean, default: true },
    requiresShipping: { type: Boolean, default: true },
    isReturnable: { type: Boolean, default: true },
    returnWindowDays: { type: Number, default: 7, min: 0 },
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  },
);

// Text search index for product search
productSchema.index(
  { name: 'text', tags: 'text', shortDescription: 'text' },
  { weights: { name: 10, tags: 5, shortDescription: 3 } },
);

// Compound indexes for common queries
productSchema.index({ status: 1, deletedAt: 1 });
productSchema.index({ status: 1, isFeatured: 1 });
productSchema.index({ status: 1, isBestSeller: 1 });
productSchema.index({ status: 1, isNewArrival: 1 });
productSchema.index({ status: 1, roomIds: 1 });
productSchema.index({ status: 1, collectionIds: 1 });
productSchema.index({ createdAt: -1 });

export const Product = mongoose.model<IProduct>('Product', productSchema);
