import mongoose, { Schema, Document } from 'mongoose';

export interface ISource extends Document {
  canonicalUrl: string;
  domain: string;
  publisher: string;
  title?: string;
  sourceType: string;
  isPrimarySource: boolean;
  reliabilityTier: string;
  language: string;
  lastCheckedAt: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SourceSchema = new Schema<ISource>(
  {
    canonicalUrl: { type: String, required: true, unique: true },
    domain: { type: String, required: true, index: true },
    publisher: { type: String, required: true },
    title: { type: String },
    sourceType: { type: String, default: 'general' },
    isPrimarySource: { type: Boolean, default: false },
    reliabilityTier: { type: String, default: 'TIER_3' },
    language: { type: String, default: 'en' },
    lastCheckedAt: { type: Date, default: Date.now },
    notes: { type: String }
  },
  { timestamps: true }
);

export const Source = mongoose.model<ISource>('Source', SourceSchema);
