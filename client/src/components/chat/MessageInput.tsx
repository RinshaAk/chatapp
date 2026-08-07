'use client';

import React, { useState, useRef } from 'react';
import { Paperclip, Smile, Send, Mic, X, Image as ImageIcon } from 'lucide-react';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import { VoiceRecorder } from './VoiceRecorder';
import { useSocket } from '../../context/SocketContext';
import { SOCKET_EVENTS, IMessage } from '@pulsechat/shared';

interface MessageInputProps {
  chatId: string;
  replyingTo: IMessage | null;
  onClearReply: () => void;
  onSendMessage: (formData: FormData) => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  chatId,
  replyingTo,
  onClearReply,
  onSendMessage
}) => {
  const { socket } = useSocket();
  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    if (socket) {
      socket.emit(SOCKET_EVENTS.TYPING_START, { chatId });
    }
  };

  const handleSend = () => {
    if (!text.trim() && selectedFiles.length === 0) return;

    const formData = new FormData();
    if (text.trim()) formData.append('text', text.trim());
    if (replyingTo) formData.append('replyTo', replyingTo._id);

    selectedFiles.forEach((file) => {
      formData.append('attachments', file);
    });

    onSendMessage(formData);
    setText('');
    setSelectedFiles([]);
    setShowEmoji(false);
    onClearReply();

    if (socket) {
      socket.emit(SOCKET_EVENTS.TYPING_STOP, { chatId });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleSendVoice = (voiceFile: File) => {
    const formData = new FormData();
    formData.append('type', 'voice');
    formData.append('attachments', voiceFile);
    onSendMessage(formData);
    setIsRecording(false);
  };

  return (
    <div className="p-4 glass-panel border-t border-slate-800/80 relative z-20 flex-shrink-0">
      {/* Replying to indicator bar */}
      {replyingTo && (
        <div className="flex items-center justify-between bg-dark-card border border-brand-500/30 rounded-xl p-2.5 mb-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-1 h-8 bg-brand-500 rounded-full" />
            <div>
              <span className="font-semibold text-brand-300">Replying to {replyingTo.sender.name}</span>
              <p className="text-slate-400 truncate max-w-md">{replyingTo.text}</p>
            </div>
          </div>
          <button onClick={onClearReply} className="p-1 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Selected file preview tags */}
      {selectedFiles.length > 0 && (
        <div className="flex items-center gap-2 mb-2 overflow-x-auto py-1">
          {selectedFiles.map((file, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 bg-dark-card border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200"
            >
              <ImageIcon className="w-4 h-4 text-brand-400" />
              <span className="truncate max-w-[120px]">{file.name}</span>
              <button
                onClick={() => setSelectedFiles(selectedFiles.filter((_, i) => i !== idx))}
                className="text-slate-400 hover:text-rose-400"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Emoji picker popup */}
      {showEmoji && (
        <div className="absolute bottom-20 left-4 z-40 shadow-2xl">
          <EmojiPicker
            theme={Theme.DARK}
            onEmojiClick={(emojiData) => setText((prev) => prev + emojiData.emoji)}
          />
        </div>
      )}

      {isRecording ? (
        <VoiceRecorder chatId={chatId} onSendVoice={handleSendVoice} onCancel={() => setIsRecording(false)} />
      ) : (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEmoji(!showEmoji)}
            className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all"
            title="Choose Emoji"
          >
            <Smile className="w-5 h-5" />
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all"
            title="Attach Files"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />

          <input
            type="text"
            value={text}
            onChange={handleTextChange}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            className="flex-1 bg-dark-bg/80 border border-slate-800 focus:border-brand-500 rounded-2xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-all"
          />

          {text.trim() || selectedFiles.length > 0 ? (
            <button
              onClick={handleSend}
              className="p-3 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-600/30 transition-all active:scale-95"
              title="Send Message"
            >
              <Send className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={() => setIsRecording(true)}
              className="p-3 rounded-2xl bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white transition-all active:scale-95"
              title="Record Voice Message"
            >
              <Mic className="w-5 h-5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
