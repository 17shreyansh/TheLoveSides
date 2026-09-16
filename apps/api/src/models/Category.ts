import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface ICategory extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  banner?: string;
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
    canonicalUrl?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
  };
  sortOrder: number;
  isActive: boolean;
  showInNavigation: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const seoSchema = new Schema(
  {
    metaTitle: { type: String, trim: true },
    metaDescription: { type: String, trim: true },
    keywords: [{ type: String }],
    canonicalUrl: { type: String, trim: true },
    ogTitle: { type: String, trim: true },
    ogDescription: { type: String, trim: true },
    ogImage: { type: String, trim: true },
  },
  { _id: false },
);

const categorySchema = new Schema<ICategory>(
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
    description: { type: String },
    image: { type: String },
    banner: { type: String },
    seo: { type: seoSchema, default: () => ({}) },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true, index: true },
    showInNavigation: { type: Boolean, default: true },
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  },
);

categorySchema.index({ sortOrder: 1 });
categorySchema.index({ isActive: 1, deletedAt: 1 });

export const Category = mongoose.model<ICategory>('Category', categorySchema);
