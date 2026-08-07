import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', NotificationController.getUserNotifications);
router.post('/read-all', NotificationController.markAllAsRead);

export default router;
