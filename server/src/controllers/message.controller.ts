import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { MessageService } from '../services/message.service.js';

export class MessageController {
  static async sendMessage(req: AuthenticatedRequest, res: Response) {
    try {
      const { chatId } = req.params;
      const files = req.files as Express.Multer.File[];
      const message = await MessageService.sendMessage(req.user._id.toString(), chatId, req.body, files);
      res.status(201).json({ success: true, data: message });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async getChatMessages(req: AuthenticatedRequest, res: Response) {
    try {
      const { chatId } = req.params;
      const page = parseInt(req.query.page as string || '1', 10);
      const limit = parseInt(req.query.limit as string || '50', 10);
      const result = await MessageService.getChatMessages(chatId, page, limit);
      console.log(`[getChatMessages] Returning ${result.messages.length} messages for chat ${chatId}`);
      res.json({ success: true, ...result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async addReaction(req: AuthenticatedRequest, res: Response) {
    try {
      const { messageId } = req.params;
      const { emoji } = req.body;
      const message = await MessageService.addReaction(req.user._id.toString(), messageId, emoji);
      res.json({ success: true, data: message });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async editMessage(req: AuthenticatedRequest, res: Response) {
    try {
      const { messageId } = req.params;
      const { text } = req.body;
      const message = await MessageService.editMessage(req.user._id.toString(), messageId, text);
      res.json({ success: true, data: message });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async deleteMessage(req: AuthenticatedRequest, res: Response) {
    try {
      const { messageId } = req.params;
      const deleteForEveryone = req.query.everyone === 'true';
      const message = await MessageService.deleteMessage(req.user._id.toString(), messageId, deleteForEveryone);
      res.json({ success: true, data: message });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async markAsRead(req: AuthenticatedRequest, res: Response) {
    try {
      const { chatId } = req.params;
      await MessageService.markAsRead(req.user._id.toString(), chatId);
      res.json({ success: true, message: 'Messages marked as read' });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async searchMessages(req: AuthenticatedRequest, res: Response) {
    try {
      const query = req.query.q as string;
      const type = req.query.type as string;
      const chatId = req.query.chatId as string;
      const messages = await MessageService.searchMessages(req.user._id.toString(), query, type, chatId);
      res.json({ success: true, data: messages });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}
