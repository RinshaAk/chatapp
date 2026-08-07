'use client';

import React, { useState } from 'react';
import { IMessage } from '@pulsechat/shared';
import { Avatar } from '../ui/Avatar';
import { Check, CheckCheck, Play, Pause, Smile, Reply, Edit3, Trash2, Star, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/index';
import { api } from '../../lib/api';

interface MessageBubbleProps {
  message: IMessage;
  onReply?: (msg: IMessage) => void;
  onEdit?: (msg: IMessage) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onReply, onEdit }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const isMe = message.sender._id === user?._id;
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);
  const [showReactions, setShowReactions] = useState(false);

  const toggleAudio = (url: string) => {
    if (!audioRef) {
      const audio = new Audio(url);
      audio.onended = () => setIsPlayingAudio(false);
      setAudioRef(audio);
      audio.play();
      setIsPlayingAudio(true);
    } else {
      if (isPlayingAudio) {
        audioRef.pause();
        setIsPlayingAudio(false);
      } else {
        audioRef.play();
        setIsPlayingAudio(true);
      }
    }
  };

  const handleAddReaction = async (emoji: string) => {
    try {
      await api.post(`/messages/${message._id}/reaction`, { emoji });
      setShowReactions(false);
    } catch (e) {}
  };

  const handleDelete = async (everyone: boolean) => {
    try {
      await api.delete(`/messages/${message._id}?everyone=${everyone}`);
    } catch (e) {}
  };

  return (
    <div className={`flex items-end gap-2 my-2 group relative ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isMe && <Avatar src={message.sender.avatar} name={message.sender.name} size="sm" />}

      <div className="max-w-[70%] flex flex-col">
        {/* Sender name for group chats */}
        {!isMe && (
          <span className="text-[11px] font-semibold text-brand-300 ml-1 mb-0.5">{message.sender.name}</span>
        )}

        {/* Reply preview */}
        {message.replyTo && (
          <div className="bg-white/10 rounded-t-xl px-3 py-1.5 border-l-2 border-brand-400 text-xs text-slate-300 mb-0.5 backdrop-blur-sm">
            <span className="font-semibold text-brand-300">{message.replyTo.sender.name}: </span>
            {message.replyTo.text}
          </div>
        )}

        {/* Bubble container */}
        <div
          className={`relative p-3 rounded-2xl text-sm shadow-md transition-all ${
            isMe
              ? 'bg-gradient-to-tr from-brand-700 to-indigo-600 text-white rounded-br-none'
              : 'glass-card text-slate-100 rounded-bl-none'
          }`}
        >
          {/* Audio / Voice message */}
          {(message.type === 'voice' || message.type === 'audio') && message.attachments?.[0] && (
            <div className="flex items-center gap-3 py-1 min-w-[200px]">
              <button
                onClick={() => toggleAudio(message.attachments![0].url)}
                className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all"
              >
                {isPlayingAudio ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </button>
              <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-white transition-all ${isPlayingAudio ? 'w-full duration-[10s]' : 'w-0'}`}
                />
              </div>
            </div>
          )}

          {/* Image & Video attachments */}
          {message.type === 'image' && message.attachments?.[0] && (
            <img
              src={message.attachments[0].url}
              alt="attachment"
              className="rounded-xl max-h-60 w-full object-cover mb-2"
            />
          )}

          {message.type === 'video' && message.attachments?.[0] && (
            <video src={message.attachments[0].url} controls className="rounded-xl max-h-60 w-full mb-2" />
          )}

          {/* Document attachment */}
          {message.type === 'document' && message.attachments?.[0] && (
            <a
              href={message.attachments[0].url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all mb-2"
            >
              <FileText className="w-8 h-8 text-brand-300" />
              <div className="min-w-0">
                <p className="text-xs font-semibold truncate">{message.attachments[0].name}</p>
                <p className="text-[10px] text-slate-300">
                  {(message.attachments[0].size / 1024).toFixed(1)} KB
                </p>
              </div>
            </a>
          )}

          {/* Main Text */}
          {message.text && <p className="whitespace-pre-wrap break-words">{message.text}</p>}

          {/* Bottom Timestamp & Receipt status */}
          <div
            className={`flex items-center justify-end gap-1 text-[10px] mt-1 ${
              isMe ? 'text-brand-200' : 'text-slate-400'
            }`}
          >
            {message.isEdited && <span>(edited)</span>}
            <span>{format(new Date(message.createdAt), 'HH:mm')}</span>
            {isMe && (
              <span>
                {message.status === 'read' ? (
                  <CheckCheck className="w-3.5 h-3.5 text-blue-400" />
                ) : message.status === 'delivered' ? (
                  <CheckCheck className="w-3.5 h-3.5 text-slate-300" />
                ) : (
                  <Check className="w-3.5 h-3.5 text-slate-300" />
                )}
              </span>
            )}
          </div>

          {/* Reactions preview */}
          {message.reactions && message.reactions.length > 0 && (
            <div className="absolute -bottom-2.5 right-2 flex items-center gap-0.5 bg-dark-card border border-slate-700 rounded-full px-2 py-0.5 text-xs shadow-md">
              {message.reactions.map((r, i) => (
                <span key={i}>{r.emoji}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Hover action triggers */}
      <div className="hidden group-hover:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => setShowReactions(!showReactions)}
          className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
          title="React"
        >
          <Smile className="w-4 h-4" />
        </button>
        {onReply && (
          <button
            onClick={() => onReply(message)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
            title="Reply"
          >
            <Reply className="w-4 h-4" />
          </button>
        )}
        {isMe && onEdit && message.type === 'text' && (
          <button
            onClick={() => onEdit(message)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
            title="Edit"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        )}
        {isMe && (
          <button
            onClick={() => handleDelete(true)}
            className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400"
            title="Delete for everyone"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Emoji reaction popup */}
      {showReactions && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 glass-panel rounded-full px-3 py-1 flex items-center gap-2 shadow-2xl z-30 animate-in fade-in zoom-in-95">
          {['❤️', '👍', '😂', '😮', '😢', '🔥'].map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleAddReaction(emoji)}
              className="hover:scale-125 transition-transform text-base"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
