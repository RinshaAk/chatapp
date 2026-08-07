import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller.js';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/stats', AdminController.getStats);
router.get('/users', AdminController.getAllUsers);
router.post('/users/:userId/toggle-block', AdminController.toggleUserBlock);
router.post('/broadcast', AdminController.broadcastNotification);

export default router;
