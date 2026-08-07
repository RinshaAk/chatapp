import { IUserSummary } from './user.js';

export type MessageType =
  | 'text'
  | 'image'
  | 'video'
  | 'audio'
  | 'voice'
  | 'document'
  | 'location'
  | 'contact'
  | 'sticker'
  | 'link'
  | 'system';

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface Attachment {
  url: string;
  publicId?: string;
  type: string;
  name: string;
  size: number;
  thumbnail?: string;
  duration?: number; // for audio/video
  width?: number;
  height?: number;
}

export interface Reaction {
  user: IUserSummary;
  emoji: string;
  createdAt: string;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  name?: string;
}

export interface ContactData {
  name: string;
  phone: string;
  email?: string;
  avatar?: string;
}

export interface IMessage {
  _id: string;
  chatId: string;
  sender: IUserSummary;
  text?: string;
  type: MessageType;
  attachments?: Attachment[];
  replyTo?: IMessage;
  reactions?: Reaction[];
  mentions?: IUserSummary[];
  status: MessageStatus;
  deliveredTo?: string[]; // array of user IDs
  readBy?: string[]; // array of user IDs
  starredBy?: string[]; // array of user IDs
  pinnedBy?: string[]; // array of user IDs
  location?: LocationData;
  contact?: ContactData;
  isEdited?: boolean;
  isDeleted?: boolean;
  deletedFor?: string[]; // array of user IDs (delete for me)
  createdAt: string;
  updatedAt: string;
}
