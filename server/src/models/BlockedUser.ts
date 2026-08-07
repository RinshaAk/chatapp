import mongoose, { Schema, Document } from 'mongoose';

export interface IBlockedUserDocument extends Document {
  user: mongoose.Types.ObjectId;
  blockedUser: mongoose.Types.ObjectId;
}

const BlockedUserSchema = new Schema<IBlockedUserDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    blockedUser: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true }
  },
  { timestamps: true }
);

BlockedUserSchema.index({ user: 1, blockedUser: 1 }, { unique: true });

export const BlockedUser = mongoose.model<IBlockedUserDocument>('BlockedUser', BlockedUserSchema);
