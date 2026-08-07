import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IUserSummary } from '@pulsechat/shared';

export interface ActiveCallState {
  callId: string;
  caller: IUserSummary;
  receiverId: string;
  type: 'audio' | 'video';
  status: 'incoming' | 'outgoing' | 'connected' | 'ended';
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  chatId?: string;
}

interface CallState {
  activeCall: ActiveCallState | null;
  incomingCall: ActiveCallState | null;
}

const initialState: CallState = {
  activeCall: null,
  incomingCall: null
};

export const callSlice = createSlice({
  name: 'call',
  initialState,
  reducers: {
    setIncomingCall: (state, action: PayloadAction<ActiveCallState | null>) => {
      state.incomingCall = action.payload;
    },
    startCall: (state, action: PayloadAction<ActiveCallState>) => {
      state.activeCall = action.payload;
      state.incomingCall = null;
    },
    updateCallStatus: (state, action: PayloadAction<'connected' | 'ended'>) => {
      if (state.activeCall) {
        state.activeCall.status = action.payload;
      }
    },
    toggleMute: (state) => {
      if (state.activeCall) {
        state.activeCall.isMuted = !state.activeCall.isMuted;
      }
    },
    toggleVideo: (state) => {
      if (state.activeCall) {
        state.activeCall.isVideoOff = !state.activeCall.isVideoOff;
      }
    },
    toggleScreenShare: (state) => {
      if (state.activeCall) {
        state.activeCall.isScreenSharing = !state.activeCall.isScreenSharing;
      }
    },
    endCall: (state) => {
      state.activeCall = null;
      state.incomingCall = null;
    }
  }
});

export const {
  setIncomingCall,
  startCall,
  updateCallStatus,
  toggleMute,
  toggleVideo,
  toggleScreenShare,
  endCall
} = callSlice.actions;

export default callSlice.reducer;
