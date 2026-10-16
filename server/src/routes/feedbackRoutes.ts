import { Router } from 'express';
import { feedbackController, feedbackSchema } from '../controllers/feedbackController';
import { optionalAuth } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';

const router = Router();

router.post('/', optionalAuth, validateRequest(feedbackSchema), (req: any, res) =>
  feedbackController.submitFeedback(req, res)
);

export default router;
