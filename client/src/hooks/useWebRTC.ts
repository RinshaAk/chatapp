'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';
import { SOCKET_EVENTS } from '@pulsechat/shared';

interface UseWebRTCOptions {
  targetUserId: string;
  isCaller: boolean;
  callType: 'audio' | 'video';
  callStatus: string;
  onCallEnd?: () => void;
}

export const useWebRTC = ({ targetUserId, isCaller, callType, callStatus, onCallEnd }: UseWebRTCOptions) => {
  const { socket } = useSocket();
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [networkQuality, setNetworkQuality] = useState<'Good' | 'Fair' | 'Poor'>('Good');

  // ICE Server configurations (STUN + TURN for production NAT traversal)
  const iceServers: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      {
        urls: 'turn:openrelay.metered.ca:80',
        username: 'openrelayproject',
        credential: 'openrelayproject'
      },
      {
        urls: 'turn:openrelay.metered.ca:443',
        username: 'openrelayproject',
        credential: 'openrelayproject'
      },
      {
        urls: 'turn:openrelay.metered.ca:443?transport=tcp',
        username: 'openrelayproject',
        credential: 'openrelayproject'
      }
    ]
  };

  const cleanup = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    setLocalStream(null);
    setRemoteStream(null);
    setIsConnected(false);
  }, []);

  useEffect(() => {
    let pc: RTCPeerConnection;

    const initWebRTC = async () => {
      try {
        const constraints: MediaStreamConstraints = {
          audio: true,
          video: callType === 'video' ? { width: { ideal: 1280 }, height: { ideal: 720 } } : false
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        localStreamRef.current = stream;
        setLocalStream(stream);

        pc = new RTCPeerConnection(iceServers);
        peerConnectionRef.current = pc;

        // Add local tracks to peer connection
        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
        });

        // Remote track received
        pc.ontrack = (event) => {
          if (event.streams && event.streams[0]) {
            setRemoteStream(event.streams[0]);
          }
        };

        // ICE candidate sending
        pc.onicecandidate = (event) => {
          if (event.candidate && socket) {
            socket.emit(SOCKET_EVENTS.ICE_CANDIDATE, {
              targetUserId,
              candidate: event.candidate
            });
          }
        };

        pc.onconnectionstatechange = () => {
          if (pc.connectionState === 'connected') {
            setIsConnected(true);
          } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
            setNetworkQuality('Poor');
            setIsConnected(false);
          }
        };

        pc.oniceconnectionstatechange = () => {
          if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
            setIsConnected(true);
          } else if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed') {
            setNetworkQuality('Poor');
            setIsConnected(false);
          }
        };
      } catch (error) {
        console.error('[WebRTC Media Error]', error);
      }
    };

    initWebRTC();

    if (socket) {
      socket.on(SOCKET_EVENTS.SDP_OFFER, async (data: { senderId: string; sdp: any }) => {
        // Wait for camera/mic permissions before answering
        while (!localStreamRef.current) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        if (peerConnectionRef.current) {
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.sdp));
          const answer = await peerConnectionRef.current.createAnswer();
          await peerConnectionRef.current.setLocalDescription(answer);
          socket.emit(SOCKET_EVENTS.SDP_ANSWER, {
            targetUserId: data.senderId,
            sdp: answer
          });
        }
      });

      socket.on(SOCKET_EVENTS.SDP_ANSWER, async (data: { senderId: string; sdp: any }) => {
        if (peerConnectionRef.current) {
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.sdp));
        }
      });

      socket.on(SOCKET_EVENTS.ICE_CANDIDATE, async (data: { senderId: string; candidate: any }) => {
        if (peerConnectionRef.current && data.candidate) {
          try {
            await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
          } catch (e) {}
        }
      });
    }

    return () => {
      cleanup();
      if (socket) {
        socket.off(SOCKET_EVENTS.SDP_OFFER);
        socket.off(SOCKET_EVENTS.SDP_ANSWER);
        socket.off(SOCKET_EVENTS.ICE_CANDIDATE);
      }
    };
  }, [targetUserId, isCaller, callType]);

  // Create offer only when call is accepted/connected
  useEffect(() => {
    const createOffer = async () => {
      if (isCaller && callStatus === 'connected' && socket) {
        // Wait for camera/mic permissions before offering
        while (!localStreamRef.current || !peerConnectionRef.current) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        if (peerConnectionRef.current.localDescription) return;

        try {
          const offer = await peerConnectionRef.current.createOffer();
          await peerConnectionRef.current.setLocalDescription(offer);
          socket.emit(SOCKET_EVENTS.SDP_OFFER, {
            targetUserId,
            sdp: offer
          });
        } catch (e) {
          console.error('[WebRTC Offer Error]', e);
        }
      }
    };
    
    createOffer();
  }, [callStatus, isCaller, targetUserId, socket]);

  const toggleMic = (muted: boolean) => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((t) => (t.enabled = !muted));
    }
  };

  const toggleCamera = (videoOff: boolean) => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((t) => (t.enabled = !videoOff));
    }
  };

  return {
    localStream,
    remoteStream,
    isConnected,
    networkQuality,
    toggleMic,
    toggleCamera,
    cleanup
  };
};
