import { IUserSummary } from './user.js';

export type CallType = 'audio' | 'video';
export type CallStatus = 'offered' | 'ringing' | 'answered' | 'rejected' | 'missed' | 'busy' | 'ended';

export interface ICall {
  _id: string;
  caller: IUserSummary;
  receiver: IUserSummary;
  chatId?: string;
  type: CallType;
  status: CallStatus;
  startedAt?: string;
  endedAt?: string;
  duration?: number; // in seconds
  createdAt: string;
}

export interface WebRTCSignalingPayload {
  callId: string;
  callerId: string;
  receiverId: string;
  type: CallType;
  signal?: any;
  caller?: IUserSummary;
  receiver?: IUserSummary;
}
