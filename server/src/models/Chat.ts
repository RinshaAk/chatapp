import mongoose, { Schema, Document } from 'mongoose';
import { IChat } from '@pulsechat/shared';

export interface IChatDocument extends Omit<IChat, '_id' | 'participants' | 'groupMembers' | 'groupAdmin' | 'lastMessage' | 'pinnedBy' | 'mutedBy' | 'archivedBy'>, Document {
  participants: mongoose.Types.ObjectId[];
  groupMembers?: {
    user: mongoose.Types.ObjectId;
    role: 'admin' | 'member';
    joinedAt: string;
  }[];
  groupAdmin?: mongoose.Types.ObjectId[];
  lastMessage?: mongoose.Types.ObjectId;
  pinnedBy?: mongoose.Types.ObjectId[];
  mutedBy?: mongoose.Types.ObjectId[];
  archivedBy?: mongoose.Types.ObjectId[];
}

const ChatSchema = new Schema<IChatDocument>(
  {
    type: { type: String, enum: ['direct', 'group', 'announcement'], default: 'direct', index: true },
    participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true, index: true }],
    groupName: { type: String },
    groupAvatar: { type: String },
    groupDescription: { type: String },
    groupAdmin: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    groupMembers: [
      {
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        role: { type: String, enum: ['admin', 'member'], default: 'member' },
        joinedAt: { type: String, default: () => new Date().toISOString() }
      }
    ],
    inviteCode: { type: String, unique: true, sparse: true },
    isAnnouncement: { type: Boolean, default: false },
    lastMessage: { type: Schema.Types.ObjectId, ref: 'Message' },
    pinnedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    mutedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    archivedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }]
  },
  {
    timestamps: true
  }
);

ChatSchema.index({ participants: 1, type: 1 });

export const Chat = mongoose.model<IChatDocument>('Chat', ChatSchema);
