export type AssessmentStatus =
  | 'SUPPORTED'
  | 'REFUTED'
  | 'MIXED'
  | 'INSUFFICIENT_EVIDENCE'
  | 'OUT_OF_CONTEXT'
  | 'NOT_VERIFIABLE';

export type ConfidenceLabel = 'HIGH' | 'MEDIUM' | 'LOW' | 'VERY_LOW';

export type EvidenceRelationship = 'SUPPORTS' | 'REFUTES' | 'CONTEXT' | 'MENTION';

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

export interface IEvidence {
  _id: string;
  claimId: string;
  sourceUrl: string;
  sourceTitle: string;
  publisher?: string;
  domain: string;
  publicationDate?: string;
  retrievedAt: string;
  excerpt: string;
  passage?: string;
  excerptType: 'direct_quote' | 'snippet' | 'passage';
  evidenceRelationship: EvidenceRelationship;
  semanticScore: number;
  keywordScore: number;
  provenanceScore: number;
  finalRankScore: number;
  directness: 'direct' | 'indirect';
  isPrimarySource: boolean;
  reliabilityTier: string;
  explanationOfRelevance?: string;
  contentHash?: string;
  searchQuery?: string;
}

export type ClaimType = 'factual' | 'allegation' | 'opinion' | 'prediction';

export interface IQueryDiagnostic {
  query: string;
  totalRetrieved: number;
  relevantRetained: number;
  filteredOut: number;
  reason?: string;
}

export interface IClaim {
  _id: string;
  analysisId: string;
  claimNumber: number;
  originalText: string;
  normalizedText: string;
  category: string;
  claimType?: ClaimType;
  attribution?: string;
  sourceArticleReporting?: string;
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
  queryDiagnostics?: IQueryDiagnostic[];
  evidence?: IEvidence[];
  createdAt: string;
}

export interface IAnalysis {
  _id: string;
  userId?: string;
  inputType: 'text' | 'url' | 'image' | 'document';
  originalInput: string;
  extractedText: string;
  language: string;
  overallSummary?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  processingStage: string;
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
  createdAt: string;
  completedAt?: string;
}

export interface IUser {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  preferences: {
    theme: 'light' | 'dark' | 'system';
    emailNotifications: boolean;
  };
  savedReports?: any[];
}

export interface IDashboardStats {
  totalAnalyses: number;
  totalClaimsChecked: number;
  distribution: Record<AssessmentStatus, number>;
  topicBreakdown: { topic: string; count: number }[];
  recentAnalyses: IAnalysis[];
}
