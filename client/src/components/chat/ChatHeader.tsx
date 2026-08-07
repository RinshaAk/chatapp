'use client';

import React from 'react';
import { IChat } from '@pulsechat/shared';
import { Avatar } from '../ui/Avatar';
import { Phone, Video, Search, Pin, VolumeX, MoreVertical, Users } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/index';
import { startCall } from '../../store/slices/callSlice';
import { api } from '../../lib/api';
import { setChats } from '../../store/slices/chatSlice';
import { useSocket } from '../../context/SocketContext';

interface ChatHeaderProps {
  chat: IChat;
  onOpenSearch: () => void;
  onOpenDetails: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ chat, onOpenSearch, onOpenDetails }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { onlineUsers, chats } = useSelector((state: RootState) => state.chat);

  const otherUser = chat.participants.find((p) => p._id !== user?._id);
  const title = chat.type === 'group' ? chat.groupName || 'Group Chat' : otherUser?.name || 'User';
  const avatar = chat.type === 'group' ? chat.groupAvatar : otherUser?.avatar;

  const liveStatus = otherUser ? onlineUsers[otherUser._id]?.status || otherUser.status : undefined;
  const isPinned = chat.pinnedBy?.includes(user?._id || '');
  const isMuted = chat.mutedBy?.includes(user?._id || '');

  const { socket } = useSocket();

  const handleInitiateCall = (type: 'audio' | 'video') => {
    if (!otherUser) return;
    
    const callId = `call_${Date.now()}`;
    
    // 1. Tell the server to ring the other user
    if (socket) {
      socket.emit('call:initiate', {
        receiverId: otherUser._id,
        type,
        chatId: chat._id,
        callId
      });
    }

    // 2. Open our local call window
    dispatch(
      startCall({
        callId,
        caller: {
          _id: user!._id,
          name: user!.name,
          username: user!.username,
          avatar: user!.avatar,
          status: user!.status
        },
        receiverId: otherUser._id,
        type,
        status: 'outgoing',
        isMuted: false,
        isVideoOff: false,
        isScreenSharing: false,
        chatId: chat._id
      })
    );
  };

  const handleTogglePin = async () => {
    try {
      const res = await api.post(`/chats/${chat._id}/pin`);
      const updated = chats.map((c) => (c._id === chat._id ? res.data : c));
      dispatch(setChats(updated));
    } catch (e) {}
  };

  const handleToggleMute = async () => {
    try {
      const res = await api.post(`/chats/${chat._id}/mute`);
      const updated = chats.map((c) => (c._id === chat._id ? res.data : c));
      dispatch(setChats(updated));
    } catch (e) {}
  };

  return (
    <div className="h-16 px-6 glass-panel border-b border-slate-800/80 flex items-center justify-between z-10 flex-shrink-0">
      {/* Title & Online Status */}
      <div className="flex items-center gap-3 cursor-pointer" onClick={onOpenDetails}>
        <Avatar src={avatar} name={title} status={liveStatus as any} size="md" />
        <div>
          <h2 className="text-base font-bold text-white leading-tight flex items-center gap-2">
            {title}
            {chat.type === 'group' && (
              <span className="px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 text-[10px] font-semibold flex items-center gap-1">
                <Users className="w-3 h-3" /> {chat.participants.length} members
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-400">
            {chat.type === 'group'
              ? chat.groupDescription || 'Group details'
              : liveStatus === 'online'
              ? 'Active now'
              : 'Offline'}
          </p>
        </div>
      </div>

      {/* Control Action Buttons */}
      <div className="flex items-center gap-2">
        {chat.type === 'direct' && otherUser && (
          <>
            <button
              onClick={() => handleInitiateCall('audio')}
              className="p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-all"
              title="Voice Call"
            >
              <Phone className="w-5 h-5 text-emerald-400" />
            </button>

            <button
              onClick={() => handleInitiateCall('video')}
              className="p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-all"
              title="HD Video Call"
            >
              <Video className="w-5 h-5 text-brand-400" />
            </button>
          </>
        )}

        <button
          onClick={onOpenSearch}
          className="p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-all"
          title="Search Messages"
        >
          <Search className="w-5 h-5" />
        </button>

        <button
          onClick={handleTogglePin}
          className={`p-2.5 rounded-xl transition-all ${
            isPinned ? 'text-amber-400 bg-amber-400/10' : 'text-slate-300 hover:bg-white/10'
          }`}
          title={isPinned ? 'Unpin Chat' : 'Pin Chat'}
        >
          <Pin className="w-5 h-5" />
        </button>

        <button
          onClick={handleToggleMute}
          className={`p-2.5 rounded-xl transition-all ${
            isMuted ? 'text-rose-400 bg-rose-400/10' : 'text-slate-300 hover:bg-white/10'
          }`}
          title={isMuted ? 'Unmute Notifications' : 'Mute Notifications'}
        >
          <VolumeX className="w-5 h-5" />
        </button>

        <button
          onClick={onOpenDetails}
          className="p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-all"
          title="Chat Details"
        >
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
