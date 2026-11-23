import { Router } from 'express';
import authRoutes from './authRoutes';
import analysisRoutes from './analysisRoutes';
import claimRoutes from './claimRoutes';
import userRoutes from './userRoutes';
import feedbackRoutes from './feedbackRoutes';
import adminRoutes from './adminRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/analyses', analysisRoutes);
router.use('/claims', claimRoutes);
router.use('/feedback', feedbackRoutes);
router.use('/', userRoutes); // mounts /dashboard, /profile, /reports/:id/bookmark

export default router;
