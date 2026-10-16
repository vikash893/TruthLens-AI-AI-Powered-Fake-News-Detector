import mongoose, { Schema, Document } from 'mongoose';

export type InputType = 'text' | 'url' | 'image' | 'document';
export type AnalysisStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type ProcessingStage = 'queued' | 'preprocessing' | 'extracting_claims' | 'retrieving_evidence' | 'grounding' | 'done';

export interface IAnalysis extends Document {
  userId?: mongoose.Types.ObjectId;
  inputType: InputType;
  originalInput: string;
  extractedText: string;
  language: string;
  overallSummary?: string;
  status: AnalysisStatus;
  processingStage: ProcessingStage;
  metadata?: {
    sourceUrl?: string;
    originalFileName?: string;
    fileSizeBytes?: number;
    mimeType?: string;
    pageCount?: number;
    title?: string;
    publisher?: string;
  };
  totalClaimsCount: number;
  supportedClaimsCount: number;
  refutedClaimsCount: number;
  mixedClaimsCount: number;
  insufficientClaimsCount: number;
  error?: string;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AnalysisSchema = new Schema<IAnalysis>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    inputType: { type: String, enum: ['text', 'url', 'image', 'document'], required: true },
    originalInput: { type: String, required: true },
    extractedText: { type: String, required: true },
    language: { type: String, default: 'en' },
    overallSummary: { type: String },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
      index: true
    },
    processingStage: {
      type: String,
      enum: ['queued', 'preprocessing', 'extracting_claims', 'retrieving_evidence', 'grounding', 'done'],
      default: 'queued'
    },
    metadata: {
      sourceUrl: String,
      originalFileName: String,
      fileSizeBytes: Number,
      mimeType: String,
      pageCount: Number,
      title: String,
      publisher: String
    },
    totalClaimsCount: { type: Number, default: 0 },
    supportedClaimsCount: { type: Number, default: 0 },
    refutedClaimsCount: { type: Number, default: 0 },
    mixedClaimsCount: { type: Number, default: 0 },
    insufficientClaimsCount: { type: Number, default: 0 },
    error: { type: String },
    completedAt: { type: Date }
  },
  { timestamps: true }
);

AnalysisSchema.index({ createdAt: -1 });

export const Analysis = mongoose.model<IAnalysis>('Analysis', AnalysisSchema);
