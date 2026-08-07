'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/index';
import { SOCKET_EVENTS, IMessage } from '@pulsechat/shared';
import {
  addMessage,
  setTyping,
  setRecording,
  setUserOnlineStatus,
  updateMessage
} from '../store/slices/chatSlice';
import { setIncomingCall, updateCallStatus, endCall } from '../store/slices/callSlice';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({ socket: null, isConnected: false });

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const dispatch = useDispatch();
  const { token, user } = useSelector((state: RootState) => state.auth);
  const { activeChatId } = useSelector((state: RootState) => state.chat);

  useEffect(() => {
    if (!token || !user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const newSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      autoConnect: true
    });

    newSocket.on('connect', () => {
      console.log('[SocketClient] Connected with ID:', newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('[SocketClient] Disconnected');
      setIsConnected(false);
    });

    // Real-time Messaging
    newSocket.on(SOCKET_EVENTS.MESSAGE_RECEIVE, async (message: IMessage) => {
      dispatch(addMessage(message));

      // Handle delivery and read receipts
      if (message.sender._id !== user._id) {
        if (!document.hidden && message.chatId === activeChatId) {
          // Instantly mark as read since they are looking at the chat
          newSocket.emit(SOCKET_EVENTS.MESSAGE_READ, { chatId: message.chatId, messageId: message._id });
        } else {
          // Just mark as delivered
          newSocket.emit('message:delivered', { chatId: message.chatId, messageId: message._id });
        }
      }

      // If the chat doesn't exist in our list yet, fetch the latest chats
      const state = require('../store/index').store.getState();
      const chatExists = state.chat.chats.some((c: any) => c._id === message.chatId);
      if (!chatExists) {
        try {
          const { api } = require('../lib/api');
          const res = await api.get('/chats');
          dispatch(require('../store/slices/chatSlice').setChats(res.data));
        } catch (e) {}
      }

      // Play audio notification chime if not current active chat or tab inactive
      if (typeof window !== 'undefined' && message.sender._id !== user._id) {
        try {
          const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
          audio.volume = 0.5;
          audio.play().catch(() => {});
        } catch (e) {}

        // Browser notification if permitted
        if (Notification.permission === 'granted' && (document.hidden || message.chatId !== activeChatId)) {
          new Notification(message.sender.name, {
            body: message.text || 'Sent an attachment',
            icon: message.sender.avatar
          });
        }
      }
    });

    // Message status updates from others
    newSocket.on('message:delivered', (data: { chatId: string; messageId: string; userId: string }) => {
      dispatch(require('../store/slices/chatSlice').updateMessageStatus({
        chatId: data.chatId,
        messageId: data.messageId,
        status: 'delivered'
      }));
    });

    newSocket.on(SOCKET_EVENTS.MESSAGE_READ, (data: any) => {
      dispatch(require('../store/slices/chatSlice').updateMessageStatus({
        chatId: data.chatId,
        messageId: data.messageId,
        status: 'read'
      }));
    });

    newSocket.on('chat:read', (data: { chatId: string; userId: string }) => {
      dispatch(require('../store/slices/chatSlice').markChatAsRead(data.chatId));
    });

    // Typing events
    newSocket.on(SOCKET_EVENTS.TYPING_START, (data: { chatId: string; username: string }) => {
      dispatch(setTyping({ chatId: data.chatId, username: data.username, isTyping: true }));
    });

    newSocket.on(SOCKET_EVENTS.TYPING_STOP, (data: { chatId: string; username: string }) => {
      dispatch(setTyping({ chatId: data.chatId, username: data.username, isTyping: false }));
    });

    // Recording events
    newSocket.on(SOCKET_EVENTS.RECORDING_START, (data: { chatId: string; username: string }) => {
      dispatch(setRecording({ chatId: data.chatId, username: data.username, isRecording: true }));
    });

    newSocket.on(SOCKET_EVENTS.RECORDING_STOP, (data: { chatId: string; username: string }) => {
      dispatch(setRecording({ chatId: data.chatId, username: data.username, isRecording: false }));
    });

    // Presence events
    newSocket.on(SOCKET_EVENTS.USER_ONLINE, (data: { userId: string; lastSeen: string }) => {
      dispatch(setUserOnlineStatus({ userId: data.userId, status: 'online', lastSeen: data.lastSeen }));
    });

    newSocket.on(SOCKET_EVENTS.USER_OFFLINE, (data: { userId: string; lastSeen: string }) => {
      dispatch(setUserOnlineStatus({ userId: data.userId, status: 'offline', lastSeen: data.lastSeen }));
    });

    newSocket.on(SOCKET_EVENTS.STATUS_CHANGE, (data: { userId: string; status: string; lastSeen?: string }) => {
      dispatch(setUserOnlineStatus(data));
    });

    // WebRTC Signaling events
    newSocket.on(SOCKET_EVENTS.CALL_INCOMING, (data: any) => {
      dispatch(
        setIncomingCall({
          callId: data.callId,
          caller: data.caller,
          receiverId: user._id,
          type: data.type,
          status: 'incoming',
          isMuted: false,
          isVideoOff: false,
          isScreenSharing: false,
          chatId: data.chatId
        })
      );
    });

    newSocket.on(SOCKET_EVENTS.CALL_ACCEPT, () => {
      dispatch(updateCallStatus('connected'));
    });

    newSocket.on(SOCKET_EVENTS.CALL_REJECT, () => {
      dispatch(endCall());
    });

    newSocket.on(SOCKET_EVENTS.CALL_END, () => {
      dispatch(endCall());
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token, user?._id]);

  return <SocketContext.Provider value={{ socket, isConnected }}>{children}</SocketContext.Provider>;
};

export const useSocket = () => useContext(SocketContext);
