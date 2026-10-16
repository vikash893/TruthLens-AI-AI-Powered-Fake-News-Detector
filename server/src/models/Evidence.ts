import mongoose, { Schema, Document } from 'mongoose';

export type EvidenceRelationship = 'SUPPORTS' | 'REFUTES' | 'CONTEXT' | 'MENTION';
export type ExcerptType = 'direct_quote' | 'snippet' | 'passage';

export interface IEvidence extends Document {
  claimId: mongoose.Types.ObjectId;
  analysisId: mongoose.Types.ObjectId;
  sourceUrl: string;
  sourceTitle: string;
  publisher?: string;
  domain: string;
  publicationDate?: string;
  retrievedAt: Date;
  excerpt: string;
  passage?: string;
  excerptType: ExcerptType;
  evidenceRelationship: EvidenceRelationship;
  semanticScore: number;
  keywordScore: number;
  provenanceScore: number;
  finalRankScore: number;
  directness: 'direct' | 'indirect';
  isPrimarySource: boolean;
  reliabilityTier: string;
  explanationOfRelevance?: string;
  searchQuery?: string;
  contentHash?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EvidenceSchema = new Schema<IEvidence>(
  {
    claimId: { type: Schema.Types.ObjectId, ref: 'Claim', required: true, index: true },
    analysisId: { type: Schema.Types.ObjectId, ref: 'Analysis', required: true, index: true },
    sourceUrl: { type: String, required: true },
    sourceTitle: { type: String, required: true },
    publisher: { type: String },
    domain: { type: String, required: true, index: true },
    publicationDate: { type: String },
    retrievedAt: { type: Date, default: Date.now },
    excerpt: { type: String, required: true },
    passage: { type: String },
    excerptType: { type: String, enum: ['direct_quote', 'snippet', 'passage'], default: 'snippet' },
    evidenceRelationship: {
      type: String,
      enum: ['SUPPORTS', 'REFUTES', 'CONTEXT', 'MENTION'],
      required: true,
      index: true
    },
    semanticScore: { type: Number, default: 0.0 },
    keywordScore: { type: Number, default: 0.0 },
    provenanceScore: { type: Number, default: 0.0 },
    finalRankScore: { type: Number, default: 0.0, index: true },
    directness: { type: String, enum: ['direct', 'indirect'], default: 'indirect' },
    isPrimarySource: { type: Boolean, default: false },
    reliabilityTier: { type: String, default: 'TIER_3' },
    explanationOfRelevance: { type: String },
    searchQuery: { type: String },
    contentHash: { type: String }
  },
  { timestamps: true }
);

EvidenceSchema.index({ claimId: 1, evidenceRelationship: 1 });

export const Evidence = mongoose.model<IEvidence>('Evidence', EvidenceSchema);
