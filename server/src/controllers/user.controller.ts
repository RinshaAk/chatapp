import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { UserService } from '../services/user.service.js';

export class UserController {
  static async searchUsers(req: AuthenticatedRequest, res: Response) {
    try {
      const query = (req.query.q as string) || '';
      const users = await UserService.searchUsers(req.user._id.toString(), query);
      res.json({ success: true, data: users });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async getProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const { userId } = req.params;
      const user = await UserService.getProfile(userId);
      res.json({ success: true, data: user });
    } catch (error: any) {
      res.status(404).json({ success: false, error: error.message });
    }
  }

  static async updateProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const files = req.files as { avatar?: Express.Multer.File[]; coverImage?: Express.Multer.File[] };
      const updatedUser = await UserService.updateProfile(req.user._id.toString(), req.body, files);
      res.json({ success: true, message: 'Profile updated', data: updatedUser });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async blockUser(req: AuthenticatedRequest, res: Response) {
    try {
      const { targetUserId } = req.params;
      await UserService.blockUser(req.user._id.toString(), targetUserId);
      res.json({ success: true, message: 'User blocked successfully' });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async unblockUser(req: AuthenticatedRequest, res: Response) {
    try {
      const { targetUserId } = req.params;
      await UserService.unblockUser(req.user._id.toString(), targetUserId);
      res.json({ success: true, message: 'User unblocked successfully' });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async getBlockedUsers(req: AuthenticatedRequest, res: Response) {
    try {
      const blocked = await UserService.getBlockedUsers(req.user._id.toString());
      res.json({ success: true, data: blocked });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}
