import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { AdminService } from '../services/admin.service.js';

export class AdminController {
  static async getStats(req: AuthenticatedRequest, res: Response) {
    try {
      const stats = await AdminService.getStats();
      res.json({ success: true, data: stats });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async getAllUsers(req: AuthenticatedRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string || '1', 10);
      const limit = parseInt(req.query.limit as string || '20', 10);
      const result = await AdminService.getAllUsers(page, limit);
      res.json({ success: true, ...result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async toggleUserBlock(req: AuthenticatedRequest, res: Response) {
    try {
      const { userId } = req.params;
      const user = await AdminService.toggleUserBlock(userId);
      res.json({ success: true, message: `User block status toggled`, data: user });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async broadcastNotification(req: AuthenticatedRequest, res: Response) {
    try {
      const { title, message } = req.body;
      const result = await AdminService.broadcastNotification(title, message);
      res.json({ success: true, message: `Broadcast sent to ${result.count} users` });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}
