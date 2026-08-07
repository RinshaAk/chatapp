'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Trash2, Send } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { SOCKET_EVENTS } from '@pulsechat/shared';

interface VoiceRecorderProps {
  chatId: string;
  onSendVoice: (file: File) => void;
  onCancel: () => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ chatId, onSendVoice, onCancel }) => {
  const { socket } = useSocket();
  const [seconds, setSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    let timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    const startRecording = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };

        mediaRecorder.start();

        if (socket) {
          socket.emit(SOCKET_EVENTS.RECORDING_START, { chatId });
        }
      } catch (err) {
        console.error('[VoiceRecord Error]', err);
        onCancel();
      }
    };

    startRecording();

    return () => {
      clearInterval(timer);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
      }
      if (socket) {
        socket.emit(SOCKET_EVENTS.RECORDING_STOP, { chatId });
      }
    };
  }, [chatId]);

  const handleStopAndSend = () => {
    if (!mediaRecorderRef.current) return;
    mediaRecorderRef.current.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const file = new File([audioBlob], `voicenote_${Date.now()}.webm`, { type: 'audio/webm' });
      onSendVoice(file);
    };
    mediaRecorderRef.current.stop();
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="flex items-center justify-between w-full bg-rose-500/10 border border-rose-500/20 rounded-2xl px-4 py-2 text-rose-300 animate-in fade-in slide-in-from-bottom-2">
      <div className="flex items-center gap-3">
        <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
        <Mic className="w-5 h-5 text-rose-400" />
        <span className="text-sm font-mono font-bold">{formatTimer(seconds)}</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onCancel}
          className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 transition-all"
          title="Cancel Recording"
        >
          <Trash2 className="w-5 h-5" />
        </button>

        <button
          onClick={handleStopAndSend}
          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-rose-600/30 transition-all"
        >
          <Send className="w-4 h-4" /> Send Voice
        </button>
      </div>
    </div>
  );
};
