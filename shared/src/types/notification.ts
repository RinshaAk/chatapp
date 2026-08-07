import { IUserSummary } from './user.js';

export type NotificationType =
  | 'message'
  | 'group_invite'
  | 'group_added'
  | 'call_missed'
  | 'mention'
  | 'system_broadcast';

export interface INotification {
  _id: string;
  receiver: string;
  sender?: IUserSummary;
  type: NotificationType;
  title: string;
  message: string;
  data?: {
    chatId?: string;
    messageId?: string;
    callId?: string;
    link?: string;
  };
  isRead: boolean;
  createdAt: string;
}
