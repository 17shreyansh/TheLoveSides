import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface ICmsPage extends Document {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  content: string; // Rich text / HTML (sanitized)
  type: 'page' | 'legal' | 'faq' | 'blog';
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: string;
    keywords?: string[];
  };
  status: 'draft' | 'published' | 'archived';
  publishedAt?: Date;
  publishedBy?: Types.ObjectId;
  sortOrder: number;
  showInNavigation: boolean;
  showInFooter: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const cmsPageSchema = new Schema<ICmsPage>(
  {
    title: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    content: { type: String, required: true },
    type: {
      type: String,
      enum: ['page', 'legal', 'faq', 'blog'],
      default: 'page',
      index: true,
    },
    seo: {
      metaTitle: { type: String, trim: true },
      metaDescription: { type: String, trim: true },
      ogImage: { type: String },
      keywords: [{ type: String }],
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
      index: true,
    },
    publishedAt: { type: Date },
    publishedBy: { type: Schema.Types.ObjectId, ref: 'AdminUser' },
    sortOrder: { type: Number, default: 0 },
    showInNavigation: { type: Boolean, default: false },
    showInFooter: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const CmsPage = mongoose.model<ICmsPage>('CmsPage', cmsPageSchema);

// Revision history for CMS content
export interface ICmsRevision extends Document {
  _id: Types.ObjectId;
  pageId: Types.ObjectId;
  content: string;
  title: string;
  editedBy: Types.ObjectId;
  createdAt: Date;
}

const cmsRevisionSchema = new Schema<ICmsRevision>(
  {
    pageId: { type: Schema.Types.ObjectId, ref: 'CmsPage', required: true, index: true },
    content: { type: String, required: true },
    title: { type: String, required: true },
    editedBy: { type: Schema.Types.ObjectId, ref: 'AdminUser', required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

cmsRevisionSchema.index({ pageId: 1, createdAt: -1 });

export const CmsRevision = mongoose.model<ICmsRevision>('CmsRevision', cmsRevisionSchema);
