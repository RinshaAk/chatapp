'use client';

import React, { useEffect, useRef, useState } from 'react';
import { IChat, IMessage } from '@pulsechat/shared';
import { ChatHeader } from './ChatHeader';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/index';
import { api } from '../../lib/api';
import { setMessages, addMessage, clearUnreadCount } from '../../store/slices/chatSlice';
import { useSocket } from '../../context/SocketContext';
import { MessageSquare } from 'lucide-react';

interface ChatWindowProps {
  chat: IChat;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ chat }) => {
  const dispatch = useDispatch();
  const { socket } = useSocket();
  const { messages, typingUsers, recordingUsers } = useSelector((state: RootState) => state.chat);
  const [replyingTo, setReplyingTo] = useState<IMessage | null>(null);
  const [editingMsg, setEditingMsg] = useState<IMessage | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatMessages = messages[chat._id] || [];
  const currentTyping = typingUsers[chat._id] || [];
  const currentRecording = recordingUsers[chat._id] || [];

  // Fetch initial messages for active chat
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await api.get(`/messages/chat/${chat._id}`);
        dispatch(setMessages({ chatId: chat._id, messages: res.messages || [] }));
        dispatch(clearUnreadCount(chat._id));
        // Mark as read via API
        await api.post(`/messages/chat/${chat._id}/read`);
        // Notify others via socket
        if (socket) {
          socket.emit('chat:read', { chatId: chat._id });
        }
      } catch (e) {}
    };

    fetchMessages();

    if (socket) {
      socket.emit('chat:join', chat._id);
    }

    return () => {
      if (socket) {
        socket.emit('chat:leave', chat._id);
      }
    };
  }, [chat._id]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, currentTyping, currentRecording]);

  const handleSendMessage = async (formData: FormData) => {
    try {
      const res = await api.post(`/messages/chat/${chat._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      dispatch(addMessage(res.data));

      if (socket) {
        socket.emit('message:send', { chatId: chat._id, message: res.data });
      }
    } catch (e) {
      console.error('[Send Error]', e);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-dark-bg relative overflow-hidden">
      {/* Top Header */}
      <ChatHeader
        chat={chat}
        onOpenSearch={() => {}}
        onOpenDetails={() => {}}
      />

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {chatMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500">
            <MessageSquare className="w-12 h-12 opacity-30 mb-2" />
            <p className="text-sm font-medium">This is the start of your encrypted conversation</p>
          </div>
        ) : (
          chatMessages.map((msg) => (
            <MessageBubble
              key={msg._id}
              message={msg}
              onReply={(m) => setReplyingTo(m)}
              onEdit={(m) => setEditingMsg(m)}
            />
          ))
        )}

        {/* Real-time Indicators */}
        {currentTyping.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-brand-300 font-medium animate-pulse py-1">
            <span className="w-2 h-2 rounded-full bg-brand-400" />
            {currentTyping.join(', ')} is typing...
          </div>
        )}

        {currentRecording.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-rose-400 font-medium animate-pulse py-1">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            {currentRecording.join(', ')} is recording audio...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Bar */}
      <MessageInput
        chatId={chat._id}
        replyingTo={replyingTo}
        onClearReply={() => setReplyingTo(null)}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
};
