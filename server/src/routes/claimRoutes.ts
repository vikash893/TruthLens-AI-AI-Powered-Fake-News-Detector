import { Router } from 'express';
import { claimController } from '../controllers/claimController';
import { optionalAuth } from '../middleware/auth';

const router = Router();

router.get('/:id', optionalAuth, (req, res) => claimController.getClaimById(req, res));
router.get('/:id/evidence', optionalAuth, (req, res) => claimController.getClaimEvidence(req, res));

export default router;
