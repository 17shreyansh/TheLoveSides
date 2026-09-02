import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface ICollection extends Document {
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
  };
  sortOrder: number;
  isActive: boolean;
  isFeatured: boolean;
  startDate?: Date;
  endDate?: Date;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const collectionSchema = new Schema<ICollection>(
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
    description: { type: String, trim: true },
    image: { type: String },
    banner: { type: String },
    seo: {
      metaTitle: { type: String, trim: true },
      metaDescription: { type: String, trim: true },
      keywords: [{ type: String }],
    },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    startDate: { type: Date },
    endDate: { type: Date },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

collectionSchema.index({ isActive: 1, sortOrder: 1 });

export const Collection = mongoose.model<ICollection>('Collection', collectionSchema);
