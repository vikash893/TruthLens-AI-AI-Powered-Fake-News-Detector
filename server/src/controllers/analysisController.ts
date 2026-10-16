import { Response } from 'express';
import fs from 'fs';
import { z } from 'zod';
import mongoose from 'mongoose';
import { AuthenticatedRequest } from '../middleware/auth';
import { Analysis } from '../models/Analysis';
import { Claim } from '../models/Claim';
import { Evidence } from '../models/Evidence';
import { aiServiceClient } from '../services/aiServiceClient';
import { urlFetcherService } from '../services/urlFetcherService';
import { documentService } from '../services/documentService';
import { ocrService } from '../services/ocrService';
import { exportService } from '../services/exportService';
import { logger } from '../utils/logger';

export const textAnalysisSchema = z.object({
  body: z.object({
    text: z.string().min(10, 'Content must be at least 10 characters').max(30000, 'Content exceeds 30,000 characters limit')
  })
});

export const urlAnalysisSchema = z.object({
  body: z.object({
    url: z.string().url('A valid URL is required')
  })
});

export class AnalysisController {
  // Helper to persist AI results into DB
  private async persistAnalysisResults(
    analysisId: mongoose.Types.ObjectId,
    aiResult: any
  ) {
    let supportedCount = 0;
    let refutedCount = 0;
    let mixedCount = 0;
    let insufficientCount = 0;

    const createdClaims = [];

    for (let i = 0; i < aiResult.claims.length; i++) {
      const c = aiResult.claims[i];

      if (c.assessment_status === 'SUPPORTED') {
        supportedCount++;
      } else if (c.assessment_status === 'REFUTED') {
        refutedCount++;
      } else if (c.assessment_status === 'MIXED' || c.assessment_status === 'OUT_OF_CONTEXT') {
        mixedCount++;
      } else {
        insufficientCount++;
      }

      const claimDoc = await Claim.create({
        analysisId,
        claimNumber: i + 1,
        originalText: c.claim_text,
        normalizedText: c.claim_text,
        category: 'General News',
        assessmentStatus: c.assessment_status,
        assessmentExplanation: c.explanation,
        confidenceLabel: c.confidence.confidence_label,
        confidenceScore: c.confidence.calculated_confidence_score,
        confidenceFactors: {
          independentSourcesCount: c.confidence.independent_sources_count,
          primarySourcesCount: c.confidence.primary_sources_count,
          sourceAgreementRatio: c.confidence.source_agreement_ratio,
          directnessScore: c.confidence.directness_score,
          recencyFactor: c.confidence.recency_factor,
          evidenceCoverage: c.confidence.evidence_coverage,
          calculatedScore: c.confidence.calculated_confidence_score,
          calibrationNotes: c.confidence.calibration_notes
        },
        caveats: c.important_caveats || [],
        missingContext: c.missing_context,
        unresolvedQuestions: c.unresolved_questions || [],
        supportingCount: c.supporting_evidence?.length || 0,
        contradictingCount: c.contradicting_evidence?.length || 0,
        neutralCount: c.neutral_context_evidence?.length || 0
      });

      createdClaims.push(claimDoc);

      // Collect all evidence items for this claim
      const allEv = [
        ...(c.supporting_evidence || []),
        ...(c.contradicting_evidence || []),
        ...(c.neutral_context_evidence || [])
      ];

      for (const ev of allEv) {
        await Evidence.create({
          claimId: claimDoc._id,
          analysisId,
          sourceUrl: ev.source_url,
          sourceTitle: ev.source_title,
          publisher: ev.publisher,
          domain: ev.domain,
          publicationDate: ev.publication_date,
          retrievedAt: ev.retrieved_at ? new Date(ev.retrieved_at) : new Date(),
          excerpt: ev.snippet || ev.passage || '',
          passage: ev.passage || ev.snippet || '',
          excerptType: ev.excerpt_type || 'snippet',
          evidenceRelationship: ev.evidence_relationship,
          semanticScore: ev.semantic_score || 0,
          keywordScore: ev.keyword_score || 0,
          provenanceScore: ev.provenance_score || 0,
          finalRankScore: ev.final_rank_score || 0,
          directness: ev.directness || 'indirect',
          isPrimarySource: ev.is_primary_source || false,
          reliabilityTier: ev.reliability_tier || 'TIER_3',
          explanationOfRelevance: ev.explanation_of_relevance,
          searchQuery: ev.search_query
        });
      }
    }

    // Update parent analysis record
    await Analysis.findByIdAndUpdate(analysisId, {
      status: 'completed',
      processingStage: 'done',
      overallSummary: aiResult.overall_summary,
      totalClaimsCount: aiResult.claims.length,
      supportedClaimsCount: supportedCount,
      refutedClaimsCount: refutedCount,
      mixedClaimsCount: mixedCount,
      insufficientClaimsCount: insufficientCount,
      completedAt: new Date()
    });

    return createdClaims;
  }

  async analyzeText(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { text } = req.body;
    const userId = req.user ? req.user._id : undefined;

    const analysis = await Analysis.create({
      userId,
      inputType: 'text',
      originalInput: text,
      extractedText: text,
      status: 'processing',
      processingStage: 'extracting_claims'
    });

    try {
      const aiResult = await aiServiceClient.analyzeContent(text, 'text');
      await this.persistAnalysisResults(analysis._id as any, aiResult);

      const completeReport = await this.getFullReport(analysis._id.toString());
      res.status(201).json({
        success: true,
        message: 'Text analysis completed successfully.',
        data: completeReport
      });
    } catch (err: any) {
      await Analysis.findByIdAndUpdate(analysis._id, {
        status: 'failed',
        error: err.message
      });
      res.status(500).json({
        success: false,
        message: err.message || 'Failed to complete analysis.'
      });
    }
  }

  async analyzeUrl(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { url } = req.body;
    const userId = req.user ? req.user._id : undefined;

    let fetched;
    try {
      fetched = await urlFetcherService.fetchArticleSafely(url);
    } catch (fetchErr: any) {
      res.status(400).json({
        success: false,
        message: `Failed to safely retrieve URL: ${fetchErr.message}`
      });
      return;
    }

    const analysis = await Analysis.create({
      userId,
      inputType: 'url',
      originalInput: url,
      extractedText: fetched.extractedText,
      metadata: {
        sourceUrl: url,
        title: fetched.title,
        publisher: fetched.publisher
      },
      status: 'processing',
      processingStage: 'extracting_claims'
    });

    try {
      const aiResult = await aiServiceClient.analyzeContent(fetched.extractedText, 'url', url);
      await this.persistAnalysisResults(analysis._id as any, aiResult);

      const completeReport = await this.getFullReport(analysis._id.toString());
      res.status(201).json({
        success: true,
        message: 'URL content extracted and analyzed successfully.',
        data: completeReport
      });
    } catch (err: any) {
      await Analysis.findByIdAndUpdate(analysis._id, {
        status: 'failed',
        error: err.message
      });
      res.status(500).json({
        success: false,
        message: err.message || 'Failed to complete URL analysis.'
      });
    }
  }

  async analyzeImage(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No image file uploaded.' });
      return;
    }

    const filePath = req.file.path;
    const userId = req.user ? req.user._id : undefined;

    try {
      const ocrResult = await ocrService.extractTextFromImage(filePath);

      if (!ocrResult.extractedText || ocrResult.extractedText.length < 10) {
        fs.unlinkSync(filePath);
        res.status(400).json({
          success: false,
          message: 'Could not extract sufficient readable text from the uploaded image. Please ensure the screenshot has clear, visible text.'
        });
        return;
      }

      const analysis = await Analysis.create({
        userId,
        inputType: 'image',
        originalInput: req.file.originalname,
        extractedText: ocrResult.extractedText,
        metadata: {
          originalFileName: req.file.originalname,
          fileSizeBytes: req.file.size,
          mimeType: req.file.mimetype
        },
        status: 'processing',
        processingStage: 'extracting_claims'
      });

      const aiResult = await aiServiceClient.analyzeContent(ocrResult.extractedText, 'image');
      await this.persistAnalysisResults(analysis._id as any, aiResult);

      // Clean up uploaded file
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      const completeReport = await this.getFullReport(analysis._id.toString());
      res.status(201).json({
        success: true,
        message: 'Screenshot text extracted via OCR and analyzed successfully.',
        data: completeReport
      });
    } catch (err: any) {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      res.status(500).json({ success: false, message: err.message || 'Image analysis failed.' });
    }
  }

  async analyzeDocument(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No document file uploaded.' });
      return;
    }

    const filePath = req.file.path;
    const userId = req.user ? req.user._id : undefined;

    try {
      const docResult = await documentService.extractText(filePath, req.file.originalname);

      if (!docResult.extractedText || docResult.extractedText.length < 10) {
        fs.unlinkSync(filePath);
        res.status(400).json({
          success: false,
          message: 'The document appears empty or unreadable.'
        });
        return;
      }

      const analysis = await Analysis.create({
        userId,
        inputType: 'document',
        originalInput: req.file.originalname,
        extractedText: docResult.extractedText,
        metadata: {
          originalFileName: req.file.originalname,
          fileSizeBytes: docResult.fileSizeBytes,
          pageCount: docResult.pageCount
        },
        status: 'processing',
        processingStage: 'extracting_claims'
      });

      const aiResult = await aiServiceClient.analyzeContent(docResult.extractedText, 'document');
      await this.persistAnalysisResults(analysis._id as any, aiResult);

      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

      const completeReport = await this.getFullReport(analysis._id.toString());
      res.status(201).json({
        success: true,
        message: 'Document parsed and verified successfully.',
        data: completeReport
      });
    } catch (err: any) {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      res.status(500).json({ success: false, message: err.message || 'Document analysis failed.' });
    }
  }

  private async getFullReport(analysisId: string) {
    const analysis = await Analysis.findById(analysisId);
    if (!analysis) return null;

    const claims = await Claim.find({ analysisId }).sort({ claimNumber: 1 });
    const evidence = await Evidence.find({ analysisId }).sort({ finalRankScore: -1 });

    const claimsWithEvidence = claims.map((c) => {
      const cEvidence = evidence.filter((e) => e.claimId.toString() === c._id.toString());
      return {
        ...c.toObject(),
        evidence: cEvidence
      };
    });

    return {
      analysis,
      claims: claimsWithEvidence
    };
  }

  async listAnalyses(req: AuthenticatedRequest, res: Response): Promise<void> {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const search = (req.query.search as string) || '';
    const status = (req.query.status as string) || '';

    const query: any = {};
    if (req.user) {
      query.userId = req.user._id;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { originalInput: { $regex: search, $options: 'i' } },
        { overallSummary: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Analysis.countDocuments(query);
    const analyses = await Analysis.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: {
        analyses,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  }

  async getAnalysisById(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid analysis ID.' });
      return;
    }

    const report = await this.getFullReport(id);
    if (!report) {
      res.status(404).json({ success: false, message: 'Analysis not found.' });
      return;
    }

    // Access control: if user is logged in, must be owner or report must be guest/public
    if (report.analysis.userId && req.user && report.analysis.userId.toString() !== req.user._id.toString()) {
      res.status(403).json({ success: false, message: 'Access denied to this analysis report.' });
      return;
    }

    res.status(200).json({
      success: true,
      data: report
    });
  }

  async deleteAnalysis(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;

    const analysis = await Analysis.findById(id);
    if (!analysis) {
      res.status(404).json({ success: false, message: 'Analysis not found.' });
      return;
    }

    // Ownership check
    if (analysis.userId && req.user && analysis.userId.toString() !== req.user._id.toString()) {
      res.status(403).json({ success: false, message: 'Access denied.' });
      return;
    }

    await Promise.all([
      Analysis.findByIdAndDelete(id),
      Claim.deleteMany({ analysisId: id }),
      Evidence.deleteMany({ analysisId: id })
    ]);

    res.status(200).json({
      success: true,
      message: 'Analysis report and related records deleted successfully.'
    });
  }

  async exportAnalysis(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const format = (req.query.format as string) || 'json';

    const analysis = await Analysis.findById(id);
    if (!analysis) {
      res.status(404).json({ success: false, message: 'Analysis not found.' });
      return;
    }

    const claims = await Claim.find({ analysisId: id }).sort({ claimNumber: 1 });
    const evidence = await Evidence.find({ analysisId: id }).sort({ finalRankScore: -1 });

    if (format === 'html') {
      const html = exportService.generateHtmlExport(analysis, claims, evidence);
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Content-Disposition', `attachment; filename="truthlens-report-${id}.html"`);
      res.send(html);
    } else {
      const jsonData = exportService.generateJsonExport(analysis, claims, evidence);
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="truthlens-report-${id}.json"`);
      res.json(jsonData);
    }
  }
}

export const analysisController = new AnalysisController();
