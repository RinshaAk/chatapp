import { User } from '../models/User.js';
import { RefreshToken } from '../models/RefreshToken.js';
import { OTP } from '../models/OTP.js';
import { hashPassword, comparePassword } from '../utils/bcrypt.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { RegisterDTO, LoginDTO, ForgotPasswordDTO, ResetPasswordDTO } from '@pulsechat/shared';

export class AuthService {
  static async register(dto: RegisterDTO) {
    const existingEmail = await User.findOne({ email: dto.email.toLowerCase() });
    if (existingEmail) {
      throw new Error('Email is already registered');
    }

    const existingUsername = await User.findOne({ username: dto.username.toLowerCase() });
    if (existingUsername) {
      throw new Error('Username is already taken');
    }

    const hashedPassword = await hashPassword(dto.password);
    const user = await User.create({
      name: dto.name,
      username: dto.username.toLowerCase(),
      email: dto.email.toLowerCase(),
      phone: dto.phone || '',
      password: hashedPassword
    });

    const payload = { userId: user._id.toString(), role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await RefreshToken.create({
      user: user._id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });

    const userObj = user.toObject();
    delete (userObj as any).password;

    return { user: userObj, tokens: { accessToken, refreshToken } };
  }

  static async login(dto: LoginDTO, deviceInfo = 'Browser') {
    const user = await User.findOne({
      $or: [{ email: dto.emailOrUsername.toLowerCase() }, { username: dto.emailOrUsername.toLowerCase() }]
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isMatch = await comparePassword(dto.password, (user as any).password || '');
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    if (user.isBlocked || user.isSuspended) {
      throw new Error('Account is blocked or suspended');
    }

    const payload = { userId: user._id.toString(), role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await RefreshToken.create({
      user: user._id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      deviceInfo
    });

    const userObj = user.toObject();
    delete (userObj as any).password;

    return { user: userObj, tokens: { accessToken, refreshToken } };
  }

  static async refreshToken(token: string) {
    const payload = verifyRefreshToken(token);
    const storedToken = await RefreshToken.findOne({ token });
    if (!storedToken) {
      throw new Error('Invalid or revoked refresh token');
    }

    const newAccessToken = generateAccessToken({ userId: payload.userId, role: payload.role });
    return { accessToken: newAccessToken };
  }

  static async logout(refreshToken: string) {
    await RefreshToken.deleteOne({ token: refreshToken });
    return true;
  }

  static async forgotPassword(dto: ForgotPasswordDTO) {
    const user = await User.findOne({ email: dto.email.toLowerCase() });
    if (!user) {
      // Don't leak existence, return success
      return { message: 'If email exists, an OTP code was generated.' };
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    await OTP.create({
      email: dto.email.toLowerCase(),
      otp: otpCode,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    });

    console.log(`[AUTH OTP DEMO] Generated OTP for ${dto.email}: ${otpCode}`);
    return { message: 'OTP sent successfully', demoOtp: otpCode };
  }

  static async resetPassword(dto: ResetPasswordDTO) {
    const validOtp = await OTP.findOne({ email: dto.email.toLowerCase(), otp: dto.otp });
    if (!validOtp) {
      throw new Error('Invalid or expired OTP code');
    }

    const user = await User.findOne({ email: dto.email.toLowerCase() });
    if (!user) throw new Error('User not found');

    const hashedPassword = await hashPassword(dto.newPassword);
    (user as any).password = hashedPassword;
    await user.save();

    await OTP.deleteMany({ email: dto.email.toLowerCase() });
    return { message: 'Password reset successfully' };
  }
}
