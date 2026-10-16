import { Router } from 'express';
import { userController } from '../controllers/userController';
import { authenticate, optionalAuth } from '../middleware/auth';

const router = Router();

router.get('/dashboard', optionalAuth, (req: any, res) => userController.getDashboard(req, res));
router.get('/profile', authenticate, (req: any, res) => userController.getProfile(req, res));
router.patch('/profile', authenticate, (req: any, res) => userController.updateProfile(req, res));
router.post('/reports/:id/bookmark', authenticate, (req: any, res) =>
  userController.toggleBookmark(req, res)
);

export default router;
