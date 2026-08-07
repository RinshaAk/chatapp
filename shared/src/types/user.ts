export type UserOnlineStatus = 'online' | 'offline' | 'away' | 'busy' | 'invisible';

export interface PrivacySettings {
  lastSeenVisibility: 'everyone' | 'contacts' | 'nobody';
  profilePhotoVisibility: 'everyone' | 'contacts' | 'nobody';
  aboutVisibility: 'everyone' | 'contacts' | 'nobody';
  readReceipts: boolean;
  groupAddPermission: 'everyone' | 'contacts' | 'nobody';
}

export interface NotificationPreferences {
  messageNotifications: boolean;
  groupNotifications: boolean;
  callNotifications: boolean;
  soundEnabled: boolean;
  previewMessage: boolean;
}

export interface UserDevice {
  deviceId: string;
  deviceName: string;
  ipAddress?: string;
  lastActive: string;
}

export interface IUser {
  _id: string;
  name: string;
  username: string;
  email: string;
  phone?: string;
  bio?: string;
  avatar?: string;
  coverImage?: string;
  status: UserOnlineStatus;
  lastSeen?: string;
  privacySettings: PrivacySettings;
  themePreference: 'dark' | 'light' | 'system';
  notificationSettings: NotificationPreferences;
  isVerified?: boolean;
  role: 'user' | 'admin';
  isBlocked?: boolean;
  isSuspended?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IUserSummary {
  _id: string;
  name: string;
  username: string;
  avatar?: string;
  status: UserOnlineStatus;
  lastSeen?: string;
  bio?: string;
}
