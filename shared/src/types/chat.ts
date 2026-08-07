import { IUserSummary } from './user.js';
import { IMessage } from './message.js';

export type ChatType = 'direct' | 'group' | 'announcement';

export interface GroupMember {
  user: IUserSummary;
  role: 'admin' | 'member';
  joinedAt: string;
}

export interface IChat {
  _id: string;
  type: ChatType;
  participants: IUserSummary[];
  groupName?: string;
  groupAvatar?: string;
  groupDescription?: string;
  groupAdmin?: string[]; // user IDs
  groupMembers?: GroupMember[];
  inviteCode?: string;
  isAnnouncement?: boolean;
  lastMessage?: IMessage;
  unreadCount?: number;
  pinnedBy?: string[]; // user IDs who pinned this chat
  mutedBy?: string[]; // user IDs who muted this chat
  archivedBy?: string[]; // user IDs who archived this chat
  createdAt: string;
  updatedAt: string;
}
