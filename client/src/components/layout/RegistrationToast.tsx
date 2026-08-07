'use client';

import React, { useEffect, useState } from 'react';
import { useSocket } from '../../context/SocketContext';
import { SOCKET_EVENTS, IUser } from '@pulsechat/shared';
import { Avatar } from '../ui/Avatar';
import { MessageSquare, X } from 'lucide-react';
import { api } from '../../lib/api';
import { useDispatch, useSelector } from 'react-redux';
import { setChats, setActiveChatId } from '../../store/slices/chatSlice';
import { RootState } from '../../store';

export const RegistrationToast = () => {
  const { socket } = useSocket();
  const dispatch = useDispatch();
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const [newUser, setNewUser] = useState<IUser | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!socket || !currentUser) return;

    const handleRegistered = (user: IUser) => {
      // Don't show for ourselves
      if (user._id === currentUser._id) return;
      
      setNewUser(user);
      setIsVisible(true);
      
      // Auto hide after 10 seconds
      setTimeout(() => {
        setIsVisible(false);
      }, 10000);
    };

    socket.on(SOCKET_EVENTS.USER_REGISTERED, handleRegistered);

    return () => {
      socket.off(SOCKET_EVENTS.USER_REGISTERED, handleRegistered);
    };
  }, [socket, currentUser]);

  const handleStartChat = async () => {
    if (!newUser) return;
    try {
      const res = await api.post('/chats/direct', { targetUserId: newUser._id });
      const chatsRes = await api.get('/chats');
      dispatch(setChats(chatsRes.data));
      dispatch(setActiveChatId(res.data._id));
      setIsVisible(false);
    } catch (e) {
      console.error(e);
    }
  };

  if (!isVisible || !newUser) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-4 bg-slate-900 border border-brand-500/30 rounded-2xl p-4 shadow-2xl animate-in slide-in-from-bottom-5 fade-in duration-300">
      <Avatar name={newUser.name} src={newUser.avatar} size="md" />
      <div className="flex-1 min-w-[150px]">
        <h4 className="text-sm font-semibold text-white">{newUser.name}</h4>
        <p className="text-xs text-brand-400">Just joined PulseChat!</p>
      </div>
      <button 
        onClick={handleStartChat}
        className="px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-lg shadow-brand-600/20"
      >
        <MessageSquare className="w-3.5 h-3.5" />
        Say Hi
      </button>
      <button 
        onClick={() => setIsVisible(false)}
        className="p-1 hover:bg-white/10 rounded-full text-slate-400 transition-colors ml-2"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
