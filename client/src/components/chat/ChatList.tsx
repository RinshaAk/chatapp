'use client';

import React from 'react';
import { IChat, IUserSummary } from '@pulsechat/shared';
import { Avatar } from '../ui/Avatar';
import { Pin, VolumeX, Plus, Users, Search } from 'lucide-react';
import { format, isToday } from 'date-fns';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/index';
import { setActiveChatId } from '../../store/slices/chatSlice';

interface ChatListProps {
  onOpenCreateGroup: () => void;
}

export const ChatList: React.FC<ChatListProps> = ({ onOpenCreateGroup }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { chats, activeChatId, onlineUsers } = useSelector((state: RootState) => state.chat);
  const [filter, setFilter] = React.useState('');

  const getChatTitle = (chat: IChat): string => {
    if (chat.type === 'group') return chat.groupName || 'Group Chat';
    const otherParticipant = chat.participants.find((p) => p._id !== user?._id);
    return otherParticipant?.name || 'Unknown User';
  };

  const getChatAvatar = (chat: IChat): string | undefined => {
    if (chat.type === 'group') return chat.groupAvatar;
    const otherParticipant = chat.participants.find((p) => p._id !== user?._id);
    return otherParticipant?.avatar;
  };

  const getChatStatus = (chat: IChat): 'online' | 'offline' | 'away' | 'busy' | undefined => {
    if (chat.type === 'group') return undefined;
    const otherParticipant = chat.participants.find((p) => p._id !== user?._id);
    if (!otherParticipant) return undefined;
    const liveStatus = onlineUsers[otherParticipant._id]?.status;
    return (liveStatus as any) || otherParticipant.status;
  };

  const filteredChats = chats.filter((chat) =>
    getChatTitle(chat).toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="w-80 bg-dark-sidebar/60 border-r border-slate-800/80 flex flex-col h-full flex-shrink-0">
      {/* Header & Create Group */}
      <div className="p-4 flex items-center justify-between border-b border-slate-800/60">
        <h2 className="text-xl font-bold text-white tracking-tight">Messages</h2>
        <button
          onClick={onOpenCreateGroup}
          className="p-2 rounded-xl bg-brand-600/20 text-brand-400 hover:bg-brand-600 hover:text-white transition-all flex items-center gap-1.5 text-xs font-semibold"
          title="Create New Group"
        >
          <Plus className="w-4 h-4" /> Group
        </button>
      </div>

      {/* Search Input */}
      <div className="p-3">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 absolute left-3 text-slate-500" />
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search chats..."
            className="w-full bg-dark-bg/80 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>

      {/* Chats Scroll List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1">
        {filteredChats.length === 0 ? (
          <div className="text-center py-10 px-4">
            <Users className="w-10 h-10 text-slate-600 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium text-slate-400">No conversations yet</p>
            <p className="text-xs text-slate-500 mt-1">Start chatting with contacts</p>
          </div>
        ) : (
          filteredChats.map((chat) => {
            const isActive = chat._id === activeChatId;
            const isPinned = chat.pinnedBy?.includes(user?._id || '');
            const isMuted = chat.mutedBy?.includes(user?._id || '');
            const title = getChatTitle(chat);
            const avatar = getChatAvatar(chat);
            const status = getChatStatus(chat);

            return (
              <button
                key={chat._id}
                onClick={() => {
                  dispatch(setActiveChatId(chat._id));
                  localStorage.setItem('pulsechat_active_chat', chat._id);
                }}
                className={`w-full p-3 rounded-2xl flex items-center gap-3 transition-all text-left group relative ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20'
                    : 'hover:bg-white/5 text-slate-300'
                }`}
              >
                <Avatar src={avatar} name={title} status={status} size="md" />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3
                      className={`text-sm font-semibold truncate ${
                        isActive ? 'text-white' : 'text-slate-200 group-hover:text-white'
                      }`}
                    >
                      {title}
                    </h3>
                    {chat.lastMessage && (
                      <span className={`text-[10px] ${isActive ? 'text-brand-100' : 'text-slate-500'}`}>
                        {format(new Date(chat.lastMessage.createdAt), 'HH:mm')}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <p className={`text-xs truncate ${isActive ? 'text-brand-100' : 'text-slate-400'}`}>
                      {chat.lastMessage
                        ? chat.lastMessage.type === 'text'
                          ? chat.lastMessage.text
                          : `[${chat.lastMessage.type.toUpperCase()}]`
                        : 'No messages yet'}
                    </p>

                    <div className="flex items-center gap-1.5 ml-2">
                      {isMuted && <VolumeX className="w-3 h-3 text-slate-500" />}
                      {isPinned && <Pin className="w-3 h-3 text-amber-400 fill-amber-400" />}
                      {chat.unreadCount && chat.unreadCount > 0 ? (
                        <span className="px-1.5 py-0.5 rounded-full bg-indigo-500 text-white font-bold text-[10px] shadow-sm">
                          {chat.unreadCount}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
