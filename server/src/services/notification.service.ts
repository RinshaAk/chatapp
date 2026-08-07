import { Notification } from '../models/Notification.js';

export class NotificationService {
  static async createNotification(receiverId: string, senderId: string | undefined, type: any, title: string, message: string, data?: any) {
    return Notification.create({
      receiver: receiverId,
      sender: senderId,
      type,
      title,
      message,
      data
    });
  }

  static async getUserNotifications(userId: string) {
    return Notification.find({ receiver: userId })
      .populate('sender', '_id name username avatar')
      .sort({ createdAt: -1 })
      .limit(50);
  }

  static async markAllAsRead(userId: string) {
    await Notification.updateMany({ receiver: userId, isRead: false }, { isRead: true });
    return true;
  }
}
