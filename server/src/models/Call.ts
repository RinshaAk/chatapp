import mongoose, { Schema, Document } from 'mongoose';
import { ICall } from '@pulsechat/shared';

export interface ICallDocument extends Omit<ICall, '_id' | 'caller' | 'receiver'>, Document {
  caller: mongoose.Types.ObjectId;
  receiver: mongoose.Types.ObjectId;
}

const CallSchema = new Schema<ICallDocument>(
  {
    caller: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    receiver: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    chatId: { type: Schema.Types.ObjectId, ref: 'Chat' },
    type: { type: String, enum: ['audio', 'video'], required: true },
    status: {
      type: String,
      enum: ['offered', 'ringing', 'answered', 'rejected', 'missed', 'busy', 'ended'],
      default: 'offered',
      index: true
    },
    startedAt: { type: String },
    endedAt: { type: String },
    duration: { type: Number, default: 0 }
  },
  {
    timestamps: true
  }
);

export const Call = mongoose.model<ICallDocument>('Call', CallSchema);
