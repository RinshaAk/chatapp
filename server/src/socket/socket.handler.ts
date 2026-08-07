import { Server } from 'socket.io';
import { socketAuthMiddleware, AuthenticatedSocket } from './socket.auth.js';
import { setupPresenceEvents } from './presence.events.js';
import { setupChatEvents } from './chat.events.js';
import { setupWebRTCEvents } from './webrtc.events.js';

export let ioInstance: Server | null = null;
export const getIO = () => {
  if (!ioInstance) throw new Error('Socket.IO not initialized');
  return ioInstance;
};

export const initializeSocketIO = (io: Server) => {
  ioInstance = io;
  io.use(socketAuthMiddleware as any);

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`[Socket] Connected: ${socket.user.name} (${socket.user._id}) - Socket ID: ${socket.id}`);

    // Register event modules
    setupPresenceEvents(io, socket);
    setupChatEvents(io, socket);
    setupWebRTCEvents(io, socket);

    socket.on('error', (err) => {
      console.error(`[Socket Error] ${socket.user.name}:`, err);
    });
  });
};
