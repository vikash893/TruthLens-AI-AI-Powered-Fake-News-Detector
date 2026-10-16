import axios from 'axios';
import { config } from '../config';
import { logger } from '../utils/logger';

export interface AIClaimResponse {
  claim_id: string;
  claim_text: string;
  assessment_status: string;
  explanation: string;
  confidence: {
    independent_sources_count: number;
    primary_sources_count: number;
    source_agreement_ratio: number;
    directness_score: number;
    recency_factor: number;
    evidence_coverage: number;
    calculated_confidence_score: number;
    confidence_label: string;
    calibration_notes: string;
  };
  supporting_evidence: any[];
  contradicting_evidence: any[];
  neutral_context_evidence: any[];
  important_caveats: string[];
  citations: any[];
  missing_context?: string;
  unresolved_questions: string[];
}

export interface AIAnalysisResult {
  content_type: string;
  detected_language: string;
  total_claims_extracted: number;
  verifiable_claims_count: number;
  supported_claims_count: number;
  refuted_claims_count: number;
  mixed_claims_count: number;
  insufficient_evidence_count: number;
  overall_summary: string;
  claims: AIClaimResponse[];
  created_at: string;
}

export class AIServiceClient {
  private client = axios.create({
    baseURL: config.aiServiceUrl,
    timeout: 35000,
    headers: {
      'Content-Type': 'application/json',
      'X-Internal-Secret': config.internalApiSecret
    }
  });

  async checkHealth(): Promise<boolean> {
    try {
      const res = await this.client.get('/health');
      return res.status === 200 && res.data.status === 'healthy';
    } catch (err: any) {
      logger.warn(`AI service healthcheck failed: ${err.message}`);
      return false;
    }
  }

  async analyzeContent(
    content: string,
    inputType: string = 'text',
    sourceUrl?: string
  ): Promise<AIAnalysisResult> {
    try {
      logger.info(`Sending analysis request to AI service (${content.length} chars, inputType=${inputType})`);
      const res = await this.client.post<AIAnalysisResult>('/v1/analyze', {
        content,
        input_type: inputType,
        source_url: sourceUrl,
        max_claims: 6
      });
      return res.data;
    } catch (err: any) {
      logger.error(`AI service call failed: ${err.message}`);
      throw new Error(
        `AI processing service unavailable (${err.message}). Ensure the Python FastAPI service is running on ${config.aiServiceUrl}.`
      );
    }
  }
}

export const aiServiceClient = new AIServiceClient();
