import { Message } from '../models/Message.js';
import { Chat } from '../models/Chat.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';

export class MessageService {
  static async sendMessage(
    senderId: string,
    chatId: string,
    payload: {
      text?: string;
      type?: string;
      replyTo?: string;
      location?: any;
      contact?: any;
    },
    files?: Express.Multer.File[]
  ) {
    const chat = await Chat.findById(chatId);
    if (!chat) throw new Error('Chat not found');

    const attachments: any[] = [];
    if (files && files.length > 0) {
      for (const file of files) {
        const uploadRes = await uploadToCloudinary(file.buffer, file.originalname, 'attachments');
        let fileType = 'document';
        if (file.mimetype.startsWith('image/')) fileType = 'image';
        else if (file.mimetype.startsWith('video/')) fileType = 'video';
        else if (file.mimetype.startsWith('audio/')) fileType = payload.type === 'voice' ? 'voice' : 'audio';

        attachments.push({
          url: uploadRes.url,
          publicId: uploadRes.public_id,
          type: fileType,
          name: file.originalname,
          size: file.size
        });
      }
    }

    const messageType = payload.type || (attachments.length > 0 ? attachments[0].type : 'text');

    const message = await Message.create({
      chatId,
      sender: senderId,
      text: payload.text || '',
      type: messageType,
      attachments,
      replyTo: payload.replyTo || undefined,
      location: payload.location,
      contact: payload.contact,
      status: 'sent',
      readBy: [senderId],
      deliveredTo: [senderId]
    });

    // Update chat last message
    chat.lastMessage = message._id as any;
    await chat.save();

    return message.populate([
      { path: 'sender', select: '_id name username avatar status lastSeen' },
      { path: 'replyTo', populate: { path: 'sender', select: '_id name username' } }
    ]);
  }

  static async getChatMessages(chatId: string, page = 1, limit = 50, userId?: string) {
    const skip = (page - 1) * limit;
    const filter: any = { chatId };
    if (userId) filter.deletedFor = { $ne: userId };

    const messages = await Message.find(filter)
      .populate('sender', '_id name username avatar status lastSeen')
      .populate({ path: 'replyTo', populate: { path: 'sender', select: '_id name username' } })
      .populate('reactions.user', '_id name username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Message.countDocuments(filter);

    return {
      messages: messages.reverse(),
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  }

  static async addReaction(userId: string, messageId: string, emoji: string) {
    const message = await Message.findById(messageId);
    if (!message) throw new Error('Message not found');

    // Remove existing reaction from this user if present
    message.reactions = message.reactions?.filter((r: any) => r.user.toString() !== userId) || [];
    message.reactions.push({ user: userId as any, emoji, createdAt: new Date().toISOString() });

    await message.save();
    return message.populate('reactions.user', '_id name username avatar');
  }

  static async editMessage(userId: string, messageId: string, text: string) {
    const message = await Message.findById(messageId);
    if (!message) throw new Error('Message not found');
    if (message.sender.toString() !== userId) throw new Error('Cannot edit another user message');

    message.text = text;
    message.isEdited = true;
    await message.save();
    return message;
  }

  static async deleteMessage(userId: string, messageId: string, deleteForEveryone = false) {
    const message = await Message.findById(messageId);
    if (!message) throw new Error('Message not found');

    if (deleteForEveryone) {
      if (message.sender.toString() !== userId) throw new Error('Cannot delete for everyone');
      message.isDeleted = true;
      message.text = 'This message was deleted';
      message.attachments = [];
      await message.save();
    } else {
      message.deletedFor = message.deletedFor || [];
      if (!message.deletedFor.includes(userId as any)) {
        message.deletedFor.push(userId as any);
      }
      await message.save();
    }

    return message;
  }

  static async markAsRead(userId: string, chatId: string) {
    await Message.updateMany(
      { chatId, sender: { $ne: userId }, readBy: { $ne: userId } },
      { $addToSet: { readBy: userId, deliveredTo: userId }, $set: { status: 'read' } }
    );
    return true;
  }

  static async searchMessages(userId: string, query: string, type?: string, chatId?: string) {
    if (!query && !type) return [];
    const filter: any = { isDeleted: { $ne: true } };

    if (chatId) {
      filter.chatId = chatId;
    } else {
      // Find chats where user is participant
      const userChats = await Chat.find({ participants: userId }).select('_id');
      filter.chatId = { $in: userChats.map(c => c._id) };
    }

    if (query) {
      filter.text = new RegExp(query, 'i');
    }

    if (type) {
      filter.type = type;
    }

    return Message.find(filter)
      .populate('sender', '_id name username avatar')
      .populate('chatId', '_id groupName type')
      .sort({ createdAt: -1 })
      .limit(30);
  }
}
