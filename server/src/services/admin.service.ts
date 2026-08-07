import { User } from '../models/User.js';
import { Chat } from '../models/Chat.js';
import { Message } from '../models/Message.js';
import { Call } from '../models/Call.js';
import { NotificationService } from './notification.service.js';

export class AdminService {
  static async getStats() {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: { $ne: 'offline' } });
    const totalChats = await Chat.countDocuments();
    const totalMessages = await Message.countDocuments();
    const totalCalls = await Call.countDocuments();

    return {
      totalUsers,
      activeUsers,
      totalChats,
      totalMessages,
      totalCalls
    };
  }

  static async getAllUsers(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const users = await User.find().select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit);
    const total = await User.countDocuments();
    return {
      users,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) }
    };
  }

  static async toggleUserBlock(userId: string) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    user.isBlocked = !user.isBlocked;
    await user.save();
    return user;
  }

  static async broadcastNotification(title: string, message: string) {
    const users = await User.find().select('_id');
    for (const u of users) {
      await NotificationService.createNotification(u._id.toString(), undefined, 'system_broadcast', title, message);
    }
    return { count: users.length };
  }
}
