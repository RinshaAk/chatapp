import { Server } from 'socket.io';
import { AuthenticatedSocket } from './socket.auth.js';
import { SOCKET_EVENTS } from '@pulsechat/shared';

export const setupWebRTCEvents = (io: Server, socket: AuthenticatedSocket) => {
  const userId = socket.user._id.toString();

  // Initiate call -> emit incoming call to target user
  socket.on(SOCKET_EVENTS.CALL_INITIATE, (data: { receiverId: string; type: 'audio' | 'video'; chatId?: string; callId?: string }) => {
    io.to(`user_${data.receiverId}`).emit(SOCKET_EVENTS.CALL_INCOMING, {
      caller: {
        _id: userId,
        name: socket.user.name,
        username: socket.user.username,
        avatar: socket.user.avatar
      },
      receiverId: data.receiverId,
      type: data.type,
      chatId: data.chatId,
      callId: data.callId || `call_${Date.now()}`
    });
  });

  // Accept call
  socket.on(SOCKET_EVENTS.CALL_ACCEPT, (data: { callerId: string; callId: string }) => {
    io.to(`user_${data.callerId}`).emit(SOCKET_EVENTS.CALL_ACCEPT, {
      callId: data.callId,
      acceptedBy: userId
    });
  });

  // Reject call
  socket.on(SOCKET_EVENTS.CALL_REJECT, (data: { callerId: string; callId: string }) => {
    io.to(`user_${data.callerId}`).emit(SOCKET_EVENTS.CALL_REJECT, {
      callId: data.callId,
      rejectedBy: userId
    });
  });

  // End call
  socket.on(SOCKET_EVENTS.CALL_END, (data: { targetUserId: string; callId: string }) => {
    io.to(`user_${data.targetUserId}`).emit(SOCKET_EVENTS.CALL_END, {
      callId: data.callId,
      endedBy: userId
    });
  });

  // SDP Offer signal
  socket.on(SOCKET_EVENTS.SDP_OFFER, (data: { targetUserId: string; sdp: any }) => {
    io.to(`user_${data.targetUserId}`).emit(SOCKET_EVENTS.SDP_OFFER, {
      senderId: userId,
      sdp: data.sdp
    });
  });

  // SDP Answer signal
  socket.on(SOCKET_EVENTS.SDP_ANSWER, (data: { targetUserId: string; sdp: any }) => {
    io.to(`user_${data.targetUserId}`).emit(SOCKET_EVENTS.SDP_ANSWER, {
      senderId: userId,
      sdp: data.sdp
    });
  });

  // ICE Candidate relay
  socket.on(SOCKET_EVENTS.ICE_CANDIDATE, (data: { targetUserId: string; candidate: any }) => {
    io.to(`user_${data.targetUserId}`).emit(SOCKET_EVENTS.ICE_CANDIDATE, {
      senderId: userId,
      candidate: data.candidate
    });
  });

  // Screen share toggle
  socket.on(SOCKET_EVENTS.SCREEN_SHARE_TOGGLE, (data: { targetUserId: string; isSharing: boolean }) => {
    io.to(`user_${data.targetUserId}`).emit(SOCKET_EVENTS.SCREEN_SHARE_TOGGLE, {
      senderId: userId,
      isSharing: data.isSharing
    });
  });
};
