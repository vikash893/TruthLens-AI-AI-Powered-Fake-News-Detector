import { IAnalysis } from '../models/Analysis';
import { IClaim } from '../models/Claim';
import { IEvidence } from '../models/Evidence';

export class ExportService {
  generateJsonExport(analysis: IAnalysis, claims: IClaim[], evidence: IEvidence[]): any {
    return {
      truthlens_version: '1.0.0',
      export_timestamp: new Date().toISOString(),
      analysis: {
        id: analysis._id,
        input_type: analysis.inputType,
        original_input: analysis.originalInput,
        extracted_text: analysis.extractedText,
        detected_language: analysis.language,
        overall_summary: analysis.overallSummary,
        status: analysis.status,
        metrics: {
          total_claims: analysis.totalClaimsCount,
          supported: analysis.supportedClaimsCount,
          refuted: analysis.refutedClaimsCount,
          mixed: analysis.mixedClaimsCount,
          insufficient_evidence: analysis.insufficientClaimsCount
        },
        metadata: analysis.metadata,
        created_at: analysis.createdAt,
        completed_at: analysis.completedAt
      },
      claims: claims.map((c) => {
        const claimEvidence = evidence.filter((e) => e.claimId.toString() === c._id.toString());
        return {
          claim_number: c.claimNumber,
          claim_text: c.originalText,
          category: c.category,
          is_verifiable: c.isVerifiable,
          assessment_status: c.assessmentStatus,
          assessment_explanation: c.assessmentExplanation,
          confidence: {
            label: c.confidenceLabel,
            score: c.confidenceScore,
            factors: c.confidenceFactors
          },
          caveats: c.caveats,
          missing_context: c.missingContext,
          unresolved_questions: c.unresolvedQuestions,
          evidence: claimEvidence.map((e) => ({
            source_title: e.sourceTitle,
            source_url: e.sourceUrl,
            publisher: e.publisher,
            domain: e.domain,
            relationship: e.evidenceRelationship,
            directness: e.directness,
            excerpt: e.excerpt,
            is_primary_source: e.isPrimarySource,
            reliability_tier: e.reliabilityTier
          }))
        };
      })
    };
  }

  generateHtmlExport(analysis: IAnalysis, claims: IClaim[], evidence: IEvidence[]): string {
    const claimsHtml = claims
      .map((c) => {
        const cEv = evidence.filter((e) => e.claimId.toString() === c._id.toString());
        const statusColors: Record<string, string> = {
          SUPPORTED: '#16a34a',
          REFUTED: '#dc2626',
          MIXED: '#d97706',
          INSUFFICIENT_EVIDENCE: '#6b7280',
          OUT_OF_CONTEXT: '#ea580c',
          NOT_VERIFIABLE: '#9333ea'
        };
        const badgeColor = statusColors[c.assessmentStatus] || '#4b5563';

        return `
        <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 18px; margin-bottom: 20px; background: #ffffff;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <span style="font-size: 13px; font-weight: 700; color: #4b5563;">CLAIM #${c.claimNumber} • ${c.category}</span>
            <span style="background: ${badgeColor}; color: white; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: bold;">
              ${c.assessmentStatus.replace('_', ' ')}
            </span>
          </div>
          <h3 style="margin: 0 0 10px 0; font-size: 17px; color: #111827;">"${c.originalText}"</h3>
          <p style="color: #374151; font-size: 14px; line-height: 1.5; margin-bottom: 12px;">${c.assessmentExplanation}</p>
          <div style="font-size: 12px; color: #6b7280; margin-bottom: 12px;">
            Confidence: <strong>${c.confidenceLabel}</strong> (${Math.round(c.confidenceScore * 100)}%) | Sources: ${cEv.length} retrieved
          </div>
          <h4 style="font-size: 13px; margin: 12px 0 6px 0; color: #1f2937;">Retrieved Citations & Evidence:</h4>
          <ul style="padding-left: 20px; font-size: 13px; color: #4b5563;">
            ${cEv
              .map(
                (e) => `
              <li style="margin-bottom: 6px;">
                <span style="font-weight: 600;">[${e.evidenceRelationship}]</span>
                <a href="${e.sourceUrl}" target="_blank" style="color: #2563eb; text-decoration: underline;">${e.sourceTitle}</a>
                (${e.publisher || e.domain}) — <em>"${e.excerpt.substring(0, 120)}..."</em>
              </li>`
              )
              .join('')}
          </ul>
        </div>
      `;
      })
      .join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>TruthLens AI Verification Report</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #f9fafb; color: #111827; padding: 40px; margin: 0; }
          .container { max-width: 850px; margin: 0 auto; background: white; padding: 35px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
          .header { border-bottom: 2px solid #e5e7eb; padding-bottom: 18px; margin-bottom: 25px; }
          .summary-box { background: #f3f4f6; padding: 15px; border-radius: 8px; margin-bottom: 25px; font-size: 14px; }
          @media print { body { padding: 0; background: white; } .container { box-shadow: none; padding: 0; } }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 24px; color: #1e3a8a;">TruthLens AI — Verification Report</h1>
            <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 13px;">Evidence First, Verdict Second • Generated on ${new Date().toLocaleDateString()}</p>
          </div>
          <div class="summary-box">
            <strong>Overall Findings:</strong> ${analysis.overallSummary || 'Verification completed.'}
          </div>
          <h2>Extracted Claims & Evidence Corroboration</h2>
          ${claimsHtml}
          <div style="border-top: 1px solid #e5e7eb; margin-top: 30px; padding-top: 15px; font-size: 11px; color: #9ca3af; text-align: center;">
            TruthLens AI • College Major Project & Research Prototype • Evidence-Based Misinformation Analyzer
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

export const exportService = new ExportService();
