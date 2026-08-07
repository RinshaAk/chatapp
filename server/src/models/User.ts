import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from '@pulsechat/shared';

export interface IUserDocument extends Omit<IUser, '_id'>, Document {}

const UserSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true, trim: true },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    phone: { type: String, default: '' },
    bio: { type: String, default: 'Hey there! I am using PulseChat.' },
    avatar: { type: String, default: '' },
    coverImage: { type: String, default: '' },
    status: {
      type: String,
      enum: ['online', 'offline', 'away', 'busy', 'invisible'],
      default: 'offline',
      index: true
    },
    lastSeen: { type: String, default: () => new Date().toISOString() },
    privacySettings: {
      lastSeenVisibility: { type: String, enum: ['everyone', 'contacts', 'nobody'], default: 'everyone' },
      profilePhotoVisibility: { type: String, enum: ['everyone', 'contacts', 'nobody'], default: 'everyone' },
      aboutVisibility: { type: String, enum: ['everyone', 'contacts', 'nobody'], default: 'everyone' },
      readReceipts: { type: Boolean, default: true },
      groupAddPermission: { type: String, enum: ['everyone', 'contacts', 'nobody'], default: 'everyone' }
    },
    themePreference: { type: String, enum: ['dark', 'light', 'system'], default: 'dark' },
    notificationSettings: {
      messageNotifications: { type: Boolean, default: true },
      groupNotifications: { type: Boolean, default: true },
      callNotifications: { type: Boolean, default: true },
      soundEnabled: { type: Boolean, default: true },
      previewMessage: { type: Boolean, default: true }
    },
    isVerified: { type: Boolean, default: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isBlocked: { type: Boolean, default: false },
    isSuspended: { type: Boolean, default: false }
  },
  {
    timestamps: true
  }
);

// Search indexes
UserSchema.index({ name: 'text', username: 'text', email: 'text' });

export const User = mongoose.model<IUserDocument>('User', UserSchema);
