import { User } from '../models/User.js';
import { BlockedUser } from '../models/BlockedUser.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';

export class UserService {
  static async searchUsers(currentUserId: string, query: string) {
    if (!query || query.trim().length === 0) return [];

    const regex = new RegExp(query, 'i');
    return User.find({
      _id: { $ne: currentUserId },
      isBlocked: { $ne: true },
      $or: [{ name: regex }, { username: regex }, { email: regex }]
    })
      .select('_id name username avatar status lastSeen bio')
      .limit(20);
  }

  static async getProfile(userId: string) {
    const user = await User.findById(userId).select('-password');
    if (!user) throw new Error('User not found');
    return user;
  }

  static async updateProfile(userId: string, data: any, files?: { avatar?: Express.Multer.File[]; coverImage?: Express.Multer.File[] }) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    if (files?.avatar?.[0]) {
      const uploadRes = await uploadToCloudinary(files.avatar[0].buffer, files.avatar[0].originalname, 'avatars');
      user.avatar = uploadRes.url;
    }

    if (files?.coverImage?.[0]) {
      const uploadRes = await uploadToCloudinary(files.coverImage[0].buffer, files.coverImage[0].originalname, 'covers');
      user.coverImage = uploadRes.url;
    }

    if (data.name) user.name = data.name;
    if (data.phone) user.phone = data.phone;
    if (data.bio) user.bio = data.bio;
    if (data.themePreference) user.themePreference = data.themePreference;
    if (data.privacySettings) user.privacySettings = { ...user.privacySettings, ...data.privacySettings };
    if (data.notificationSettings) user.notificationSettings = { ...user.notificationSettings, ...data.notificationSettings };

    await user.save();
    return user;
  }

  static async blockUser(userId: string, targetUserId: string) {
    if (userId === targetUserId) throw new Error('Cannot block yourself');
    await BlockedUser.create({ user: userId, blockedUser: targetUserId });
    return true;
  }

  static async unblockUser(userId: string, targetUserId: string) {
    await BlockedUser.deleteOne({ user: userId, blockedUser: targetUserId });
    return true;
  }

  static async getBlockedUsers(userId: string) {
    const blockedList = await BlockedUser.find({ user: userId }).populate('blockedUser', '_id name username avatar');
    return blockedList.map(item => item.blockedUser);
  }
}
