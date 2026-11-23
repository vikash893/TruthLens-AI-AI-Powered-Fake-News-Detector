import { Router } from 'express';
import { adminController } from '../controllers/adminController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

// All routes require authentication and admin role
router.use(authenticate, requireAdmin);

router.get('/metrics', (req, res) => adminController.getMetrics(req, res));
router.get('/users', (req, res) => adminController.listUsers(req, res));
router.patch('/users/:id/status', (req, res) => adminController.toggleBlockStatus(req, res));
router.delete('/users/:id', (req, res) => adminController.deleteUser(req, res));
router.post('/users/create-admin', (req, res) => adminController.createAdmin(req, res));
router.get('/logs', (req, res) => adminController.getLogs(req, res));

export default router;
