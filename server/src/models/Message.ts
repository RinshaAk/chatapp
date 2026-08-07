import mongoose, { Schema, Document } from 'mongoose';
import { IMessage } from '@pulsechat/shared';

export interface IMessageDocument extends Omit<IMessage, '_id' | 'chatId' | 'sender' | 'replyTo' | 'mentions' | 'deliveredTo' | 'readBy' | 'starredBy' | 'pinnedBy' | 'deletedFor'>, Document {
  chatId: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  replyTo?: mongoose.Types.ObjectId;
  mentions?: mongoose.Types.ObjectId[];
  deliveredTo?: mongoose.Types.ObjectId[];
  readBy?: mongoose.Types.ObjectId[];
  starredBy?: mongoose.Types.ObjectId[];
  pinnedBy?: mongoose.Types.ObjectId[];
  deletedFor?: mongoose.Types.ObjectId[];
}

const AttachmentSchema = new Schema({
  url: { type: String, required: true },
  publicId: { type: String },
  type: { type: String, required: true },
  name: { type: String, required: true },
  size: { type: Number, required: true },
  thumbnail: { type: String },
  duration: { type: Number },
  width: { type: Number },
  height: { type: Number }
});

const ReactionSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  emoji: { type: String, required: true },
  createdAt: { type: String, default: () => new Date().toISOString() }
});

const MessageSchema = new Schema<IMessageDocument>(
  {
    chatId: { type: Schema.Types.ObjectId, ref: 'Chat', required: true, index: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    text: { type: String, default: '' },
    type: {
      type: String,
      enum: ['text', 'image', 'video', 'audio', 'voice', 'document', 'location', 'contact', 'sticker', 'link', 'system'],
      default: 'text',
      index: true
    },
    attachments: [AttachmentSchema],
    replyTo: { type: Schema.Types.ObjectId, ref: 'Message' },
    reactions: [ReactionSchema],
    mentions: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    status: {
      type: String,
      enum: ['sending', 'sent', 'delivered', 'read', 'failed'],
      default: 'sent',
      index: true
    },
    deliveredTo: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    readBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    starredBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    pinnedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    location: {
      latitude: { type: Number },
      longitude: { type: Number },
      address: { type: String },
      name: { type: String }
    },
    contact: {
      name: { type: String },
      phone: { type: String },
      email: { type: String },
      avatar: { type: String }
    },
    isEdited: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    deletedFor: [{ type: Schema.Types.ObjectId, ref: 'User' }]
  },
  {
    timestamps: true
  }
);

MessageSchema.index({ chatId: 1, createdAt: -1 });
MessageSchema.index({ text: 'text' });

export const Message = mongoose.model<IMessageDocument>('Message', MessageSchema);
