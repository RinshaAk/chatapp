import { UserOnlineStatus } from './user.js';
import { IMessage } from './message.js';
import { IChat } from './chat.js';
import { CallType, CallStatus } from './call.js';

export const SOCKET_EVENTS = {
  // Connection
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  AUTHENTICATE: 'authenticate',
  
  // Presence
  USER_ONLINE: 'user:online',
  USER_OFFLINE: 'user:offline',
  STATUS_CHANGE: 'user:status-change',
  USER_REGISTERED: 'user:registered',
  
  // Messaging
  MESSAGE_SEND: 'message:send',
  MESSAGE_RECEIVE: 'message:receive',
  MESSAGE_READ: 'message:read',
  MESSAGE_DELIVERED: 'message:delivered',
  MESSAGE_EDIT: 'message:edit',
  MESSAGE_DELETE: 'message:delete',
  MESSAGE_REACTION: 'message:reaction',
  
  // Typing & Indicators
  TYPING_START: 'typing:start',
  TYPING_STOP: 'typing:stop',
  RECORDING_START: 'recording:start',
  RECORDING_STOP: 'recording:stop',
  
  // Group Events
  GROUP_UPDATE: 'group:update',
  GROUP_MEMBER_ADD: 'group:member-add',
  GROUP_MEMBER_REMOVE: 'group:member-remove',
  
  // WebRTC Calling
  CALL_INITIATE: 'call:initiate',
  CALL_INCOMING: 'call:incoming',
  CALL_ACCEPT: 'call:accept',
  CALL_REJECT: 'call:reject',
  CALL_END: 'call:end',
  CALL_BUSY: 'call:busy',
  ICE_CANDIDATE: 'call:ice-candidate',
  SDP_OFFER: 'call:sdp-offer',
  SDP_ANSWER: 'call:sdp-answer',
  SCREEN_SHARE_TOGGLE: 'call:screen-share-toggle',

  // Notifications
  NOTIFICATION_NEW: 'notification:new'
} as const;

export interface TypingPayload {
  chatId: string;
  userId: string;
  username: string;
}

export interface StatusChangePayload {
  userId: string;
  status: UserOnlineStatus;
  lastSeen?: string;
}

export interface ReadReceiptPayload {
  chatId: string;
  messageId: string;
  userId: string;
  readAt: string;
}

export interface DeliveredReceiptPayload {
  chatId: string;
  messageId: string;
  userId: string;
}
