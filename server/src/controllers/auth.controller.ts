import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { getIO } from '../socket/socket.handler.js';
import { SOCKET_EVENTS } from '@pulsechat/shared';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const result = await AuthService.register(req.body);
      
      try {
        const io = getIO();
        io.emit(SOCKET_EVENTS.USER_REGISTERED, result.user);
      } catch (e) {
        console.error('Failed to emit USER_REGISTERED', e);
      }

      res.status(201).json({ success: true, message: 'Registration successful', data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const deviceInfo = req.headers['user-agent'] || 'Browser';
      const result = await AuthService.login(req.body, deviceInfo);
      res.json({ success: true, message: 'Login successful', data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) return res.status(400).json({ success: false, error: 'Refresh token required' });
      const result = await AuthService.refreshToken(refreshToken);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(401).json({ success: false, error: error.message });
    }
  }

  static async logout(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      if (refreshToken) await AuthService.logout(refreshToken);
      res.json({ success: true, message: 'Logged out successfully' });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async forgotPassword(req: Request, res: Response) {
    try {
      const result = await AuthService.forgotPassword(req.body);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async resetPassword(req: Request, res: Response) {
    try {
      const result = await AuthService.resetPassword(req.body);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async me(req: AuthenticatedRequest, res: Response) {
    res.json({ success: true, data: req.user });
  }
}
