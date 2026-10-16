import request from 'supertest';
import { createApp } from '../src/app';
import { validateUrlForSSRF } from '../src/utils/ssrfProtection';
import { exportService } from '../src/services/exportService';

const app = createApp();

describe('TruthLens AI Backend Test Suite', () => {
  describe('1. Health Check Endpoint', () => {
    it('GET /health returns status healthy', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('healthy');
      expect(res.body.app).toBe('TruthLens AI Backend');
    });
  });

  describe('2. SSRF Protection & URL Validation (Scenario G)', () => {
    it('blocks localhost and loopback addresses', async () => {
      const res1 = await validateUrlForSSRF('http://localhost:8080/secret');
      expect(res1.isValid).toBe(false);
      expect(res1.error).toMatch(/loopback or local hostnames/i);

      const res2 = await validateUrlForSSRF('http://127.0.0.1:3000/api');
      expect(res2.isValid).toBe(false);
      expect(res2.error).toMatch(/loopback or local hostnames/i);
    });

    it('blocks cloud metadata link-local endpoints (169.254.169.254)', async () => {
      const res = await validateUrlForSSRF('http://169.254.169.254/latest/meta-data/');
      expect(res.isValid).toBe(false);
      expect(res.error).toMatch(/restricted range/i);
    });

    it('blocks private network IP ranges (10.0.0.1, 192.168.1.1)', async () => {
      const res1 = await validateUrlForSSRF('http://192.168.1.1/admin');
      expect(res1.isValid).toBe(false);

      const res2 = await validateUrlForSSRF('http://10.0.0.5/confidential');
      expect(res2.isValid).toBe(false);
    });

    it('blocks forbidden protocols like file:// and gopher://', async () => {
      const res1 = await validateUrlForSSRF('file:///etc/passwd');
      expect(res1.isValid).toBe(false);
      expect(res1.error).toMatch(/prohibited/i);

      const res2 = await validateUrlForSSRF('ftp://1.2.3.4/file');
      expect(res2.isValid).toBe(false);
      expect(res2.error).toMatch(/prohibited/i);
    });
  });

  describe('3. Export Formatting Service', () => {
    it('generates structured JSON export correctly', () => {
      const mockAnalysis: any = {
        _id: '65f01234567890abcdef1234',
        inputType: 'text',
        originalInput: 'Electricity tariffs reduced by 40%',
        extractedText: 'Electricity tariffs reduced by 40%',
        language: 'en',
        overallSummary: 'Government announcement confirmed.',
        status: 'completed',
        totalClaimsCount: 1,
        supportedClaimsCount: 1,
        refutedClaimsCount: 0,
        mixedClaimsCount: 0,
        insufficientClaimsCount: 0,
        createdAt: new Date(),
        completedAt: new Date()
      };

      const mockClaims: any[] = [
        {
          _id: '65f01234567890abcdef5678',
          claimNumber: 1,
          originalText: 'Electricity tariffs reduced by 40%',
          category: 'Finance & Economics',
          isVerifiable: true,
          assessmentStatus: 'SUPPORTED',
          assessmentExplanation: 'Corroborated by official gazette.',
          confidenceLabel: 'HIGH',
          confidenceScore: 0.88,
          confidenceFactors: {
            independentSourcesCount: 2,
            primarySourcesCount: 1,
            sourceAgreementRatio: 1.0,
            directnessScore: 1.0,
            recencyFactor: 0.85,
            evidenceCoverage: 0.9,
            calculatedScore: 0.88,
            calibrationNotes: 'High confidence based on primary records.'
          },
          caveats: ['Requires bill under 300kWh'],
          missingContext: null,
          unresolvedQuestions: []
        }
      ];

      const mockEvidence: any[] = [
        {
          claimId: '65f01234567890abcdef5678',
          sourceTitle: 'Government Decree on Electricity Tariffs',
          sourceUrl: 'https://gov.uk/decree',
          publisher: 'Official Publications',
          domain: 'gov.uk',
          evidenceRelationship: 'SUPPORTS',
          directness: 'direct',
          excerpt: 'Decree establishes a 40% reduction.',
          isPrimarySource: true,
          reliabilityTier: 'TIER_1'
        }
      ];

      const jsonExport = exportService.generateJsonExport(mockAnalysis, mockClaims, mockEvidence);
      expect(jsonExport.truthlens_version).toBe('1.0.0');
      expect(jsonExport.analysis.metrics.supported).toBe(1);
      expect(jsonExport.claims).toHaveLength(1);
      expect(jsonExport.claims[0].evidence).toHaveLength(1);
      expect(jsonExport.claims[0].evidence[0].is_primary_source).toBe(true);
    });

    it('generates styled HTML export correctly', () => {
      const mockAnalysis: any = {
        _id: '65f01234567890abcdef1234',
        overallSummary: 'Analysis verified.'
      };
      const mockClaims: any[] = [
        {
          _id: '65f01234567890abcdef5678',
          claimNumber: 1,
          originalText: 'Sample claim',
          category: 'Science',
          assessmentStatus: 'SUPPORTED',
          assessmentExplanation: 'Supported by peer review.',
          confidenceLabel: 'HIGH',
          confidenceScore: 0.9
        }
      ];
      const mockEvidence: any[] = [
        {
          claimId: '65f01234567890abcdef5678',
          sourceTitle: 'Nature Research Paper',
          sourceUrl: 'https://nature.com/article',
          publisher: 'Nature',
          domain: 'nature.com',
          evidenceRelationship: 'SUPPORTS',
          excerpt: 'Study data confirms findings.'
        }
      ];

      const html = exportService.generateHtmlExport(mockAnalysis, mockClaims, mockEvidence);
      expect(html).toContain('TruthLens AI — Verification Report');
      expect(html).toContain('Nature Research Paper');
      expect(html).toContain('SUPPORTED');
    });
  });

  describe('4. Input Validation & Error Handling', () => {
    it('rejects empty text analysis input with 400', async () => {
      const res = await request(app)
        .post('/api/v1/analyses/text')
        .send({ text: 'too short' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/validation failed/i);
    });

    it('rejects invalid URL in URL analysis endpoint with 400', async () => {
      const res = await request(app)
        .post('/api/v1/analyses/url')
        .send({ url: 'not-a-valid-url' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('returns 404 for non-existent API routes', async () => {
      const res = await request(app).get('/api/v1/non-existent-endpoint');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});
