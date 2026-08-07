import { Chat } from '../models/Chat.js';
import { User } from '../models/User.js';
import { Message } from '../models/Message.js';
import mongoose from 'mongoose';

export class ChatService {
  static async getOrCreateDirectChat(currentUserId: string, targetUserId: string) {
    let chat = await Chat.findOne({
      type: 'direct',
      participants: { $all: [currentUserId, targetUserId] }
    })
      .populate('participants', '_id name username avatar status lastSeen bio')
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: '_id name username avatar' }
      });

    if (!chat) {
      chat = await Chat.create({
        type: 'direct',
        participants: [currentUserId, targetUserId]
      });
      chat = await chat.populate('participants', '_id name username avatar status lastSeen bio');
    }

    return chat;
  }

  static async createGroupChat(currentUserId: string, name: string, memberIds: string[], description?: string, avatarUrl?: string) {
    const allMembers = Array.from(new Set([currentUserId, ...memberIds]));

    const groupMembers = allMembers.map(id => ({
      user: new mongoose.Types.ObjectId(id),
      role: (id === currentUserId ? 'admin' : 'member') as 'admin' | 'member',
      joinedAt: new Date().toISOString()
    }));

    const chat = await Chat.create({
      type: 'group',
      groupName: name,
      groupDescription: description || '',
      groupAvatar: avatarUrl || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80',
      participants: allMembers,
      groupAdmin: [currentUserId],
      groupMembers
    });

    return chat.populate('participants', '_id name username avatar status lastSeen bio');
  }

  static async getUserChats(userId: string) {
    const chats = await Chat.find({ participants: userId })
      .populate('participants', '_id name username avatar status lastSeen bio')
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: '_id name username avatar' }
      })
      .sort({ updatedAt: -1 });

    // Calculate unread count for each chat for this user
    const chatsWithUnread = await Promise.all(
      chats.map(async chat => {
        const unreadCount = await Message.countDocuments({
          chatId: chat._id,
          sender: { $ne: userId },
          readBy: { $ne: userId }
        });
        const chatObj = chat.toObject();
        return { ...chatObj, unreadCount };
      })
    );

    return chatsWithUnread;
  }

  static async togglePinChat(userId: string, chatId: string) {
    const chat = await Chat.findById(chatId);
    if (!chat) throw new Error('Chat not found');

    const index = chat.pinnedBy?.indexOf(userId as any) ?? -1;
    if (index > -1) {
      chat.pinnedBy?.splice(index, 1);
    } else {
      chat.pinnedBy = chat.pinnedBy || [];
      chat.pinnedBy.push(userId as any);
    }
    await chat.save();
    return chat;
  }

  static async toggleMuteChat(userId: string, chatId: string) {
    const chat = await Chat.findById(chatId);
    if (!chat) throw new Error('Chat not found');

    const index = chat.mutedBy?.indexOf(userId as any) ?? -1;
    if (index > -1) {
      chat.mutedBy?.splice(index, 1);
    } else {
      chat.mutedBy = chat.mutedBy || [];
      chat.mutedBy.push(userId as any);
    }
    await chat.save();
    return chat;
  }

  static async addGroupMembers(adminUserId: string, chatId: string, memberIds: string[]) {
    const chat = await Chat.findById(chatId);
    if (!chat || chat.type !== 'group') throw new Error('Group chat not found');

    if (!chat.groupAdmin?.some(id => id.toString() === adminUserId)) {
      throw new Error('Only group admins can add members');
    }

    const newParticipants = memberIds.filter(id => !chat.participants.some(p => p.toString() === id));
    chat.participants.push(...newParticipants.map(id => new mongoose.Types.ObjectId(id)));

    newParticipants.forEach(id => {
      chat.groupMembers?.push({
        user: new mongoose.Types.ObjectId(id),
        role: 'member',
        joinedAt: new Date().toISOString()
      });
    });

    await chat.save();
    return chat.populate('participants', '_id name username avatar status lastSeen bio');
  }

  static async removeGroupMember(adminUserId: string, chatId: string, targetUserId: string) {
    const chat = await Chat.findById(chatId);
    if (!chat || chat.type !== 'group') throw new Error('Group chat not found');

    if (!chat.groupAdmin?.some(id => id.toString() === adminUserId) && adminUserId !== targetUserId) {
      throw new Error('Permission denied');
    }

    chat.participants = chat.participants.filter(id => id.toString() !== targetUserId);
    chat.groupMembers = chat.groupMembers?.filter(m => m.user.toString() !== targetUserId);
    chat.groupAdmin = chat.groupAdmin?.filter(id => id.toString() !== targetUserId);

    await chat.save();
    return chat.populate('participants', '_id name username avatar status lastSeen bio');
  }
}
