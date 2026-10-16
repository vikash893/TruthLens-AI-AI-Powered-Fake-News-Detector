import mongoose, { Schema, Document } from 'mongoose';

export type AssessmentStatus =
  | 'SUPPORTED'
  | 'REFUTED'
  | 'MIXED'
  | 'INSUFFICIENT_EVIDENCE'
  | 'OUT_OF_CONTEXT'
  | 'NOT_VERIFIABLE';

export type ConfidenceLabel = 'HIGH' | 'MEDIUM' | 'LOW' | 'VERY_LOW';

export interface IConfidenceFactors {
  independentSourcesCount: number;
  primarySourcesCount: number;
  sourceAgreementRatio: number;
  directnessScore: number;
  recencyFactor: number;
  evidenceCoverage: number;
  calculatedScore: number;
  calibrationNotes: string;
}

export interface IClaim extends Document {
  analysisId: mongoose.Types.ObjectId;
  claimNumber: number;
  originalText: string;
  normalizedText: string;
  category: string;
  namedEntities: string[];
  relevantDates: string[];
  numericValues: string[];
  geographicContext?: string;
  isVerifiable: boolean;
  assessmentStatus: AssessmentStatus;
  assessmentExplanation: string;
  confidenceLabel: ConfidenceLabel;
  confidenceScore: number;
  confidenceFactors: IConfidenceFactors;
  caveats: string[];
  missingContext?: string;
  unresolvedQuestions: string[];
  supportingCount: number;
  contradictingCount: number;
  neutralCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ClaimSchema = new Schema<IClaim>(
  {
    analysisId: { type: Schema.Types.ObjectId, ref: 'Analysis', required: true, index: true },
    claimNumber: { type: Number, required: true },
    originalText: { type: String, required: true },
    normalizedText: { type: String, required: true },
    category: { type: String, default: 'General News', index: true },
    namedEntities: [{ type: String }],
    relevantDates: [{ type: String }],
    numericValues: [{ type: String }],
    geographicContext: { type: String },
    isVerifiable: { type: Boolean, default: true },
    assessmentStatus: {
      type: String,
      enum: ['SUPPORTED', 'REFUTED', 'MIXED', 'INSUFFICIENT_EVIDENCE', 'OUT_OF_CONTEXT', 'NOT_VERIFIABLE'],
      required: true,
      index: true
    },
    assessmentExplanation: { type: String, required: true },
    confidenceLabel: {
      type: String,
      enum: ['HIGH', 'MEDIUM', 'LOW', 'VERY_LOW'],
      default: 'LOW'
    },
    confidenceScore: { type: Number, default: 0.0 },
    confidenceFactors: {
      independentSourcesCount: { type: Number, default: 0 },
      primarySourcesCount: { type: Number, default: 0 },
      sourceAgreementRatio: { type: Number, default: 0.0 },
      directnessScore: { type: Number, default: 0.0 },
      recencyFactor: { type: Number, default: 0.5 },
      evidenceCoverage: { type: Number, default: 0.0 },
      calculatedScore: { type: Number, default: 0.0 },
      calibrationNotes: { type: String, default: '' }
    },
    caveats: [{ type: String }],
    missingContext: { type: String },
    unresolvedQuestions: [{ type: String }],
    supportingCount: { type: Number, default: 0 },
    contradictingCount: { type: Number, default: 0 },
    neutralCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

ClaimSchema.index({ analysisId: 1, assessmentStatus: 1 });

export const Claim = mongoose.model<IClaim>('Claim', ClaimSchema);
