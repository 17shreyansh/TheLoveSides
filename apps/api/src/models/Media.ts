import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IMedia extends Document {
  _id: Types.ObjectId;
  filename: string;
  originalFilename: string;
  mimetype: string;
  size: number;        // bytes
  url: string;
  alt?: string;
  folder?: string;     // Virtual folder for organization
  uploadedBy?: Types.ObjectId;
  createdAt: Date;
}

const mediaSchema = new Schema<IMedia>(
  {
    filename: { type: String, required: true },
    originalFilename: { type: String, required: true },
    mimetype: { type: String, required: true },
    size: { type: Number, required: true },
    url: { type: String, required: true },
    alt: { type: String, trim: true },
    folder: { type: String, trim: true, lowercase: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'AdminUser' },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

mediaSchema.index({ folder: 1, createdAt: -1 });

export const Media = mongoose.model<IMedia>('Media', mediaSchema);
