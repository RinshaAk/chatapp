import mongoose, { Schema, Document } from 'mongoose';
import { INotification } from '@pulsechat/shared';

export interface INotificationDocument extends Omit<INotification, '_id' | 'sender' | 'receiver'>, Document {
  receiver: mongoose.Types.ObjectId;
  sender?: mongoose.Types.ObjectId;
}

const NotificationSchema = new Schema<INotificationDocument>(
  {
    receiver: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User' },
    type: {
      type: String,
      enum: ['message', 'group_invite', 'group_added', 'call_missed', 'mention', 'system_broadcast'],
      required: true
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    data: {
      chatId: { type: String },
      messageId: { type: String },
      callId: { type: String },
      link: { type: String }
    },
    isRead: { type: Boolean, default: false, index: true }
  },
  {
    timestamps: true
  }
);

export const Notification = mongoose.model<INotificationDocument>('Notification', NotificationSchema);
