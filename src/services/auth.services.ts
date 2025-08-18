import User from "../models/user.model";
import { TokenService } from "./token.service";
import { comparePassword, hashpassword } from "../utils/bcrypt";
import {
  sendVerificationOtp,
  sendResetOtp,
} from "../utils/sendVerificationEmail";

interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface RefreshInput {
  refreshToken: string;
}

interface ResetPasswordInput {
  otp: string;
  newPassword: string;
}

export class AuthService {
  static async register({ name, email, password }: RegisterInput) {
    const existingUser = await User.findOne({ email });
    if (existingUser) throw new Error("User already exists");

    const hashedPassword = await hashpassword(password);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    const accessToken = TokenService.generateAccessToken({
      userId: user._id.toString(),
    });
    const refreshToken = await TokenService.generateRefreshToken(
      user._id.toString()
    );

    return { user, accessToken, refreshToken };
  }

  static async login({ email, password }: LoginInput) {
    const user = await User.findOne({ email });
    if (!user) throw new Error("User not found");

    const isValid = await comparePassword(password, user.password);
    if (!isValid) throw new Error("Invalid credentials");

    const accessToken = TokenService.generateAccessToken({
      userId: user._id.toString(),
    });
    const refreshToken = await TokenService.generateRefreshToken(
      user._id.toString()
    );

    return { user, accessToken, refreshToken };
  }

  static async refresh({ refreshToken }: RefreshInput) {
    const payload = TokenService.verifyToken<{ userId: string; jti: string }>(
      refreshToken,
      process.env.REFRESH_SECRET!
    );
    if (!payload || !payload.jti || !payload.userId)
      throw new Error("Invalid or expired refresh token");

    const valid = await TokenService.isRefreshTokenValid(
      payload.jti,
      payload.userId
    );
    if (!valid) throw new Error("Refresh token not recognized");

    const newRefreshToken = await TokenService.rotateRefreshToken(
      payload.jti,
      payload.userId
    );

    const accessToken = TokenService.generateAccessToken({
      userId: payload.userId,
    });

    return { accessToken, refreshToken: newRefreshToken };
  }

  static async logout(refreshToken: string) {
    const payload = TokenService.verifyToken<{ userId: string; jti: string }>(
      refreshToken,
      process.env.REFRESH_SECRET!
    );
    if (!payload || !payload.jti || !payload.userId)
      throw new Error("Invalid or expired refresh token");

    await TokenService.invalidateRefreshToken(payload.jti, payload.userId);
    return true;
  }

  static async sendVerificationOtp(userId: string) {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");
    if (user.isVerified) throw new Error("User already verified");

    const now = Date.now();

    if (!user.verificationTokenExpires)
      user.verificationTokenExpires = new Date(0);

    if (now - user.verificationTokenExpires.getTime() < 60 * 1000) {
      throw new Error("Wait before requesting another OTP");
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationToken = otp;
    user.verificationTokenExpires = new Date(now + 24 * 60 * 60 * 1000);
    await user.save();

    await sendVerificationOtp(user.email, user.name, otp);
    return true;
  }

  static async verifyEmail(userId: string, otp: string) {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");
    if (user.isVerified) throw new Error("User already verified");

    if (user.verificationToken !== otp) throw new Error("Invalid OTP");
    if (user.verificationTokenExpires.getTime() < Date.now())
      throw new Error("OTP expired");

    user.isVerified = true;
    user.verificationToken = "";
    user.verificationTokenExpires = new Date(0);
    await user.save();

    return true;
  }

  static async forgotPassword(email: string) {
    const user = await User.findOne({ email });
    if (!user) throw new Error("User not found");

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordToken = otp;
    user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendResetOtp(user.email, user.name, otp);
    return true;
  }

  static async resetPassword({ otp, newPassword }: ResetPasswordInput) {
    const user = await User.findOne({ resetPasswordToken: otp });
    if (!user) throw new Error("Invalid OTP");
    if (user.resetPasswordExpires.getTime() < Date.now())
      throw new Error("OTP expired");

    user.password = await hashpassword(newPassword);
    user.resetPasswordToken = "";
    user.resetPasswordExpires = new Date(0);
    user.refreshTokens = [];
    await user.save();

    return true;
  }
}
