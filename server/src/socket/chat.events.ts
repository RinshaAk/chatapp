import { Server } from 'socket.io';
import { AuthenticatedSocket } from './socket.auth.js';
import { SOCKET_EVENTS, TypingPayload, ReadReceiptPayload } from '@pulsechat/shared';
import { Chat } from '../models/Chat.js';
import { Message } from '../models/Message.js';

export const setupChatEvents = (io: Server, socket: AuthenticatedSocket) => {
  const userId = socket.user._id.toString();

  // Join a specific chat room
  socket.on('chat:join', (chatId: string) => {
    socket.join(`chat_${chatId}`);
  });

  // Leave a specific chat room
  socket.on('chat:leave', (chatId: string) => {
    socket.leave(`chat_${chatId}`);
  });

  // Typing indicators
  socket.on(SOCKET_EVENTS.TYPING_START, (data: { chatId: string }) => {
    socket.to(`chat_${data.chatId}`).emit(SOCKET_EVENTS.TYPING_START, {
      chatId: data.chatId,
      userId,
      username: socket.user.username
    } as TypingPayload);
  });

  socket.on(SOCKET_EVENTS.TYPING_STOP, (data: { chatId: string }) => {
    socket.to(`chat_${data.chatId}`).emit(SOCKET_EVENTS.TYPING_STOP, {
      chatId: data.chatId,
      userId,
      username: socket.user.username
    } as TypingPayload);
  });

  // Voice recording indicator
  socket.on(SOCKET_EVENTS.RECORDING_START, (data: { chatId: string }) => {
    socket.to(`chat_${data.chatId}`).emit(SOCKET_EVENTS.RECORDING_START, {
      chatId: data.chatId,
      userId,
      username: socket.user.username
    });
  });

  socket.on(SOCKET_EVENTS.RECORDING_STOP, (data: { chatId: string }) => {
    socket.to(`chat_${data.chatId}`).emit(SOCKET_EVENTS.RECORDING_STOP, {
      chatId: data.chatId,
      userId,
      username: socket.user.username
    });
  });

  // Real-time Message Send
  socket.on(SOCKET_EVENTS.MESSAGE_SEND, async (data: { chatId: string; message: any }) => {
    const chat = await Chat.findById(data.chatId);
    if (!chat) return;

    // Broadcast to chat room
    io.to(`chat_${data.chatId}`).emit(SOCKET_EVENTS.MESSAGE_RECEIVE, data.message);

    // Notify participants individually for badge counters / browser notifications
    chat.participants.forEach((pId: any) => {
      const pStr = pId.toString();
      if (pStr !== userId) {
        io.to(`user_${pStr}`).emit(SOCKET_EVENTS.MESSAGE_RECEIVE, data.message);
      }
    });
  });

  // Read receipts
  socket.on(SOCKET_EVENTS.MESSAGE_READ, async (data: { chatId: string; messageId: string }) => {
    const readAt = new Date().toISOString();
    await Message.findByIdAndUpdate(data.messageId, {
      $addToSet: { readBy: userId, deliveredTo: userId },
      $set: { status: 'read' }
    });

    io.to(`chat_${data.chatId}`).emit(SOCKET_EVENTS.MESSAGE_READ, {
      chatId: data.chatId,
      messageId: data.messageId,
      userId,
      readAt
    } as ReadReceiptPayload);
  });

  socket.on('chat:read', async (data: { chatId: string }) => {
    // Mark all unread messages as read in DB
    await Message.updateMany(
      { chatId: data.chatId, sender: { $ne: userId }, readBy: { $ne: userId } },
      { $addToSet: { readBy: userId, deliveredTo: userId }, $set: { status: 'read' } }
    );
    // Broadcast to chat room that all messages are read by this user
    io.to(`chat_${data.chatId}`).emit('chat:read', {
      chatId: data.chatId,
      userId
    });
  });

  socket.on('message:delivered', async (data: { chatId: string; messageId: string }) => {
    await Message.findByIdAndUpdate(data.messageId, {
      $addToSet: { deliveredTo: userId },
      $set: { status: 'delivered' }
    });

    io.to(`chat_${data.chatId}`).emit('message:delivered', {
      chatId: data.chatId,
      messageId: data.messageId,
      userId
    });
  });

  // Message Reaction Sync
  socket.on(SOCKET_EVENTS.MESSAGE_REACTION, (data: { chatId: string; messageId: string; reaction: any }) => {
    io.to(`chat_${data.chatId}`).emit(SOCKET_EVENTS.MESSAGE_REACTION, data);
  });
};
