import mongoose, { Schema, type Document } from 'mongoose';

export interface ISetting extends Document {
  key: string;
  value: unknown;
  group: string;
  description?: string;
  isPublic: boolean; // Accessible via public API
  updatedAt: Date;
}

const settingSchema = new Schema<ISetting>(
  {
    key: { type: String, required: true, unique: true, index: true },
    value: { type: Schema.Types.Mixed, required: true },
    group: { type: String, required: true, index: true },
    description: { type: String },
    isPublic: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const Setting = mongoose.model<ISetting>('Setting', settingSchema);
