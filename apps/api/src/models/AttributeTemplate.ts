import mongoose, { Schema, Document } from 'mongoose';

export interface IAttributeValue {
  name: string;
  values: string[];
}

export interface IAttributeTemplate extends Document {
  name: string;
  attributes: IAttributeValue[];
  createdAt: Date;
  updatedAt: Date;
}

const AttributeTemplateSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    attributes: [
      {
        name: { type: String, required: true },
        values: [{ type: String }],
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const AttributeTemplate = mongoose.model<IAttributeTemplate>('AttributeTemplate', AttributeTemplateSchema);
