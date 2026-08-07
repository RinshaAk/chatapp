import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { NotificationService } from '../services/notification.service.js';

export class NotificationController {
  static async getUserNotifications(req: AuthenticatedRequest, res: Response) {
    try {
      const notifications = await NotificationService.getUserNotifications(req.user._id.toString());
      res.json({ success: true, data: notifications });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async markAllAsRead(req: AuthenticatedRequest, res: Response) {
    try {
      await NotificationService.markAllAsRead(req.user._id.toString());
      res.json({ success: true, message: 'All notifications marked as read' });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}
