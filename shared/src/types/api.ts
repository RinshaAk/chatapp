import { IUser } from './user.js';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  user: IUser;
  tokens: AuthTokens;
}

export interface RegisterDTO {
  name: string;
  username: string;
  email: string;
  password: string;
  phone?: string;
}

export interface LoginDTO {
  emailOrUsername: string;
  password: string;
  rememberMe?: boolean;
}

export interface ForgotPasswordDTO {
  email: string;
}

export interface ResetPasswordDTO {
  email: string;
  otp: string;
  newPassword: string;
}

export interface SearchQueryDTO {
  query?: string;
  type?: 'users' | 'messages' | 'groups' | 'media' | 'files' | 'links' | 'voice';
  chatId?: string;
  page?: number;
  limit?: number;
}
