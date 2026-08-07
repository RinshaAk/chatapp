import { Server } from 'socket.io';
import { AuthenticatedSocket } from './socket.auth.js';
import { User } from '../models/User.js';
import { SOCKET_EVENTS } from '@pulsechat/shared';

// Track online socket connections per user ID
const onlineUsersMap = new Map<string, Set<string>>();

export const setupPresenceEvents = (io: Server, socket: AuthenticatedSocket) => {
  const userId = socket.user._id.toString();

  // Add socket to user's online sockets pool
  if (!onlineUsersMap.has(userId)) {
    onlineUsersMap.set(userId, new Set());
  }
  onlineUsersMap.get(userId)?.add(socket.id);

  // Update DB status to online
  User.findByIdAndUpdate(userId, { status: 'online', lastSeen: new Date().toISOString() }).exec();

  // Join personal socket room
  socket.join(`user_${userId}`);

  // Broadcast user online event to global channel
  io.emit(SOCKET_EVENTS.USER_ONLINE, {
    userId,
    status: 'online',
    lastSeen: new Date().toISOString()
  });

  socket.on('disconnect', async () => {
    const userSockets = onlineUsersMap.get(userId);
    if (userSockets) {
      userSockets.delete(socket.id);
      if (userSockets.size === 0) {
        onlineUsersMap.delete(userId);
        const lastSeenTime = new Date().toISOString();
        await User.findByIdAndUpdate(userId, { status: 'offline', lastSeen: lastSeenTime }).exec();

        io.emit(SOCKET_EVENTS.USER_OFFLINE, {
          userId,
          status: 'offline',
          lastSeen: lastSeenTime
        });
      }
    }
  });

  socket.on(SOCKET_EVENTS.STATUS_CHANGE, async (data: { status: 'online' | 'away' | 'busy' | 'invisible' }) => {
    await User.findByIdAndUpdate(userId, { status: data.status }).exec();
    io.emit(SOCKET_EVENTS.STATUS_CHANGE, {
      userId,
      status: data.status,
      lastSeen: new Date().toISOString()
    });
  });
};

export const isUserOnline = (userId: string): boolean => {
  return onlineUsersMap.has(userId) && (onlineUsersMap.get(userId)?.size || 0) > 0;
};
