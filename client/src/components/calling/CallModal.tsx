'use client';

import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/index';
import {
  endCall,
  toggleMute,
  toggleVideo,
  toggleScreenShare,
  updateCallStatus,
  startCall
} from '../../store/slices/callSlice';
import { useWebRTC } from '../../hooks/useWebRTC';
import { useSocket } from '../../context/SocketContext';
import { SOCKET_EVENTS } from '@pulsechat/shared';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Monitor, Signal, PhoneIncoming } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';

export const CallModal: React.FC = () => {
  const dispatch = useDispatch();
  const { socket } = useSocket();
  const { activeCall, incomingCall } = useSelector((state: RootState) => state.call);
  const { user } = useSelector((state: RootState) => state.auth);

  const currentCall = activeCall || incomingCall;
  const targetUserId = currentCall
    ? currentCall.caller._id === user?._id
      ? currentCall.receiverId
      : currentCall.caller._id
    : '';

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteMediaRef = useRef<any>(null);

  const {
    localStream,
    remoteStream,
    isConnected,
    networkQuality,
    toggleMic,
    toggleCamera,
    cleanup
  } = useWebRTC({
    targetUserId,
    isCaller: currentCall?.caller._id === user?._id,
    callType: currentCall?.type || 'audio',
    callStatus: currentCall?.status || '',
    onCallEnd: () => dispatch(endCall())
  });

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteMediaRef.current && remoteStream) {
      remoteMediaRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  if (!currentCall) return null;

  const isIncoming = currentCall.status === 'incoming';

  const handleAcceptCall = () => {
    if (socket && incomingCall) {
      socket.emit(SOCKET_EVENTS.CALL_ACCEPT, {
        callerId: incomingCall.caller._id,
        callId: incomingCall.callId
      });
      // Move from incomingCall to activeCall
      dispatch(startCall({ ...incomingCall, status: 'connected' }));
    }
  };

  const handleRejectCall = () => {
    if (socket && currentCall) {
      socket.emit(SOCKET_EVENTS.CALL_REJECT, {
        callerId: currentCall.caller._id,
        callId: currentCall.callId
      });
      cleanup();
      dispatch(endCall());
    }
  };

  const handleEndCall = () => {
    if (socket && currentCall) {
      socket.emit(SOCKET_EVENTS.CALL_END, {
        targetUserId,
        callId: currentCall.callId
      });
      cleanup();
      dispatch(endCall());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
      {/* Incoming Call Dialog */}
      {isIncoming ? (
        <div className="glass-panel p-8 rounded-3xl max-w-sm w-full text-center space-y-6 animate-pulse-slow">
          <Avatar
            src={currentCall.caller.avatar}
            name={currentCall.caller.name}
            size="xl"
            className="mx-auto ring-4 ring-brand-500/50"
          />
          <div>
            <h3 className="text-xl font-bold text-white">{currentCall.caller.name}</h3>
            <p className="text-xs text-brand-300 font-medium mt-1">
              Incoming {currentCall.type === 'video' ? 'HD Video' : 'Audio'} Call...
            </p>
          </div>

          <div className="flex items-center justify-center gap-6 pt-4">
            <button
              onClick={handleRejectCall}
              className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-600/40 transition-all active:scale-95"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
            <button
              onClick={handleAcceptCall}
              className="w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-600/40 transition-all active:scale-95 animate-bounce"
            >
              <PhoneIncoming className="w-6 h-6" />
            </button>
          </div>
        </div>
      ) : (
        /* Active / Outgoing Video Call Window */
        <div className="relative w-full max-w-5xl h-[80vh] glass-panel rounded-3xl overflow-hidden flex flex-col justify-between shadow-2xl border border-white/10">
          {/* Main Remote Video or Avatar display */}
          <div className="absolute inset-0 bg-slate-950 flex items-center justify-center">
            
            {/* Hidden audio element for audio calls */}
            {currentCall.type === 'audio' && remoteStream && (
              <audio ref={remoteMediaRef} autoPlay playsInline className="hidden" />
            )}

            {currentCall.type === 'video' && remoteStream ? (
              <video
                ref={remoteMediaRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center space-y-4">
                <Avatar
                  src={currentCall.caller.avatar}
                  name={currentCall.caller.name}
                  size="xl"
                  className="mx-auto ring-4 ring-brand-500/30"
                />
                <div>
                  <h3 className="text-2xl font-bold text-white">{currentCall.caller.name}</h3>
                  <p className="text-sm text-slate-400">
                    {isConnected ? 'Call Connected' : 'Ringing...'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Local PiP Video Window */}
          {currentCall.type === 'video' && localStream && (
            <div className="absolute top-6 right-6 w-44 h-32 bg-slate-900 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl z-20">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ transform: 'scaleX(-1)' }}
              />
            </div>
          )}

          {/* Top Bar Signal Quality */}
          <div className="relative z-10 p-6 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
            <div className="flex items-center gap-3">
              <Avatar src={currentCall.caller.avatar} name={currentCall.caller.name} size="sm" />
              <span className="text-sm font-semibold text-white">{currentCall.caller.name}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 text-xs font-mono text-emerald-400 border border-emerald-500/30">
              <Signal className="w-3.5 h-3.5" /> Network: {networkQuality}
            </div>
          </div>

          {/* Bottom Action Controls */}
          <div className="relative z-10 p-6 flex items-center justify-center gap-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
            <button
              onClick={() => {
                dispatch(toggleMute());
                toggleMic(!currentCall.isMuted);
              }}
              className={`p-4 rounded-2xl transition-all ${
                currentCall.isMuted
                  ? 'bg-rose-600 text-white'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
              title={currentCall.isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
            >
              {currentCall.isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>

            {currentCall.type === 'video' && (
              <button
                onClick={() => {
                  dispatch(toggleVideo());
                  toggleCamera(!currentCall.isVideoOff);
                }}
                className={`p-4 rounded-2xl transition-all ${
                  currentCall.isVideoOff
                    ? 'bg-rose-600 text-white'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
                title={currentCall.isVideoOff ? 'Turn Camera On' : 'Turn Camera Off'}
              >
                {currentCall.isVideoOff ? (
                  <VideoOff className="w-6 h-6" />
                ) : (
                  <Video className="w-6 h-6" />
                )}
              </button>
            )}

            <button
              onClick={() => dispatch(toggleScreenShare())}
              className="p-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all"
              title="Share Screen"
            >
              <Monitor className="w-6 h-6" />
            </button>

            <button
              onClick={handleEndCall}
              className="p-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/40 transition-all active:scale-95 ml-4"
              title="End Call"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
