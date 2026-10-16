import { Router } from 'express';
import { authController, registerSchema, loginSchema } from '../controllers/authController';
import { validateRequest } from '../middleware/validate';
import { authLimiter } from '../middleware/rateLimiter';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/register', authLimiter, validateRequest(registerSchema), (req, res) =>
  authController.register(req, res)
);
router.post('/login', authLimiter, validateRequest(loginSchema), (req, res) =>
  authController.login(req, res)
);
router.post('/logout', (req, res) => authController.logout(req, res));
router.get('/me', authenticate, (req: any, res) => authController.me(req, res));

export default router;
