import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { CallService } from '../services/call.service.js';

export class CallController {
  static async createCallLog(req: AuthenticatedRequest, res: Response) {
    try {
      const { receiverId, type, chatId } = req.body;
      const call = await CallService.createCallLog(req.user._id.toString(), receiverId, type, chatId);
      res.status(201).json({ success: true, data: call });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async updateCallStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const { callId } = req.params;
      const { status, duration } = req.body;
      const call = await CallService.updateCallStatus(callId, status, duration);
      res.json({ success: true, data: call });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async getCallHistory(req: AuthenticatedRequest, res: Response) {
    try {
      const history = await CallService.getCallHistory(req.user._id.toString());
      res.json({ success: true, data: history });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}
