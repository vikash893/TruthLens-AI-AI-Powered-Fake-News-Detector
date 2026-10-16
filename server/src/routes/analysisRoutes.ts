import { Router } from 'express';
import {
  analysisController,
  textAnalysisSchema,
  urlAnalysisSchema
} from '../controllers/analysisController';
import { optionalAuth } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { analysisLimiter } from '../middleware/rateLimiter';
import { uploadImage, uploadDocument } from '../middleware/upload';

const router = Router();

// Input routes
router.post(
  '/text',
  optionalAuth,
  analysisLimiter,
  validateRequest(textAnalysisSchema),
  (req: any, res) => analysisController.analyzeText(req, res)
);

router.post(
  '/url',
  optionalAuth,
  analysisLimiter,
  validateRequest(urlAnalysisSchema),
  (req: any, res) => analysisController.analyzeUrl(req, res)
);

router.post(
  '/image',
  optionalAuth,
  analysisLimiter,
  uploadImage.single('image'),
  (req: any, res) => analysisController.analyzeImage(req, res)
);

router.post(
  '/document',
  optionalAuth,
  analysisLimiter,
  uploadDocument.single('document'),
  (req: any, res) => analysisController.analyzeDocument(req, res)
);

// Management routes
router.get('/', optionalAuth, (req: any, res) => analysisController.listAnalyses(req, res));
router.get('/:id', optionalAuth, (req: any, res) => analysisController.getAnalysisById(req, res));
router.delete('/:id', optionalAuth, (req: any, res) => analysisController.deleteAnalysis(req, res));
router.get('/:id/export', optionalAuth, (req: any, res) => analysisController.exportAnalysis(req, res));

export default router;
