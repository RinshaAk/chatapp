import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { ChatService } from '../services/chat.service.js';

export class ChatController {
  static async getUserChats(req: AuthenticatedRequest, res: Response) {
    try {
      const chats = await ChatService.getUserChats(req.user._id.toString());
      res.json({ success: true, data: chats });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async getOrCreateDirectChat(req: AuthenticatedRequest, res: Response) {
    try {
      const { targetUserId } = req.body;
      const chat = await ChatService.getOrCreateDirectChat(req.user._id.toString(), targetUserId);
      res.json({ success: true, data: chat });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async createGroupChat(req: AuthenticatedRequest, res: Response) {
    try {
      const { name, members, description, avatarUrl } = req.body;
      const chat = await ChatService.createGroupChat(req.user._id.toString(), name, members, description, avatarUrl);
      res.status(201).json({ success: true, data: chat });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async togglePinChat(req: AuthenticatedRequest, res: Response) {
    try {
      const { chatId } = req.params;
      const chat = await ChatService.togglePinChat(req.user._id.toString(), chatId);
      res.json({ success: true, data: chat });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async toggleMuteChat(req: AuthenticatedRequest, res: Response) {
    try {
      const { chatId } = req.params;
      const chat = await ChatService.toggleMuteChat(req.user._id.toString(), chatId);
      res.json({ success: true, data: chat });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async addGroupMembers(req: AuthenticatedRequest, res: Response) {
    try {
      const { chatId } = req.params;
      const { members } = req.body;
      const chat = await ChatService.addGroupMembers(req.user._id.toString(), chatId, members);
      res.json({ success: true, data: chat });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async removeGroupMember(req: AuthenticatedRequest, res: Response) {
    try {
      const { chatId, targetUserId } = req.params;
      const chat = await ChatService.removeGroupMember(req.user._id.toString(), chatId, targetUserId);
      res.json({ success: true, data: chat });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}
