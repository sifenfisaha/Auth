import User from "../models/user.model";
import { TokenService } from "./token.service";
import { comparePassword, hashpassword } from "../utils/bcrypt";
import {
  sendVerificationOtp,
  sendResetOtp,
} from "../utils/sendVerificationEmail";
import { getAuthConfig } from "../configs/store";

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
  token: string;
}

interface ResetPasswordInput {
  otp: string;
  newPassword: string;
}

export class AuthService {
  static async register({ name, email, password }: RegisterInput) {
    const { userAdapter, onRegister } = getAuthConfig();
    if (!userAdapter) throw new Error("UserAdapter not configured");

    const existingUser = await userAdapter.getUserByEmail(email);
    if (existingUser) throw new Error("User already exists");

    const hashedPassword = await hashpassword(password);
    const newUser = await userAdapter.createUser({
      name,
      email,
      password: hashedPassword,
    });

    const accessToken = TokenService.generateAccessToken({
      userId: newUser._id.toString(),
    });
    const refreshToken = await TokenService.generateRefreshToken(
      newUser._id.toString()
    );

    const safeUser = {
      name: newUser.name,
      email: newUser.email,
      isAdmin: newUser.role === "admin",
    };
    onRegister?.(safeUser);

    return { user: safeUser, accessToken, refreshToken };
  }

  static async login({ email, password }: LoginInput) {
    const { userAdapter, onLogin } = getAuthConfig();
    if (!userAdapter) throw new Error("UserAdapter not configured");

    const user = await userAdapter.getUserByEmail(email);
    if (!user) throw new Error("User not found");

    const valid = await comparePassword(password, user.password);
    if (!valid) throw new Error("Invalid credentials");

    const accessToken = TokenService.generateAccessToken({
      userId: user._id.toString(),
    });
    const refreshToken = await TokenService.generateRefreshToken(
      user._id.toString()
    );

    const safeUser = {
      name: user.name,
      email: user.email,
      isAdmin: user.role === "admin",
    };
    onLogin?.(safeUser);

    return { user: safeUser, accessToken, refreshToken };
  }

  static async refresh({ token }: RefreshInput) {
    const { userAdapter } = getAuthConfig();
    if (!userAdapter) throw new Error("UserAdapter not configured");

    const payload = TokenService.verifyToken<{ userId: string; jti: string }>(
      token,
      getAuthConfig().refreshToken.secret
    );
    if (!payload?.userId || !payload.jti)
      throw new Error("Invalid or expired refresh token");

    const isValid = await TokenService.isRefreshTokenValid(
      payload.jti,
      payload.userId
    );
    if (!isValid) throw new Error("Refresh token not recognized");

    const newRefreshToken = await TokenService.rotateRefreshToken(
      payload.jti,
      payload.userId
    );
    const newAccessToken = TokenService.generateAccessToken({
      userId: payload.userId,
    });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  static async logout(token: string) {
    const payload = TokenService.verifyToken<{ userId: string; jti: string }>(
      token,
      getAuthConfig().refreshToken.secret
    );
    if (!payload?.userId || !payload.jti)
      throw new Error("Invalid or expired refresh token");

    await TokenService.invalidateRefreshToken(payload.jti, payload.userId);
    return true;
  }

  static async sendVerificationOtp(userId: string) {
    const { userAdapter } = getAuthConfig();
    if (!userAdapter) throw new Error("UserAdapter not configured");

    const user = await userAdapter.getUserById(userId);
    if (!user) throw new Error("User not found");
    if (user.isVerified) throw new Error("User already verified");

    const now = Date.now();
    if (
      user.verificationTokenExpires &&
      now < user.verificationTokenExpires.getTime()
    )
      throw new Error("Wait before requesting another OTP");

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await userAdapter.updateUser?.(userId, {
      verificationToken: otp,
      verificationTokenExpires: new Date(now + 24 * 60 * 60 * 1000),
    });

    await sendVerificationOtp(user.email, user.name, otp);
    return true;
  }

  static async verifyEmail(userId: string, otp: string) {
    const { userAdapter } = getAuthConfig();
    if (!userAdapter) throw new Error("UserAdapter not configured");

    const user = await userAdapter.getUserById(userId);
    if (!user) throw new Error("User not found");
    if (user.isVerified) throw new Error("User already verified");

    if (user.verificationToken !== otp) throw new Error("Invalid OTP");
    if (user.verificationTokenExpires.getTime() < Date.now())
      throw new Error("OTP expired");

    await userAdapter.updateUser?.(userId, {
      isVerified: true,
      verificationToken: "",
      verificationTokenExpires: new Date(0),
    });

    return true;
  }

  static async forgotPassword(email: string) {
    const { userAdapter } = getAuthConfig();
    if (!userAdapter) throw new Error("UserAdapter not configured");

    const user = await userAdapter.getUserByEmail(email);
    if (!user) throw new Error("User not found");

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await userAdapter.updateUser?.(user._id.toString(), {
      resetPasswordToken: otp,
      resetPasswordExpires: new Date(Date.now() + 10 * 60 * 1000),
    });

    await sendResetOtp(user.email, user.name, otp);
    return true;
  }

  static async resetPassword({ otp, newPassword }: ResetPasswordInput) {
    const { userAdapter } = getAuthConfig();
    if (!userAdapter) throw new Error("UserAdapter not configured");

    const user = await User.findOne({ resetPasswordToken: otp }); // you may also implement via userAdapter
    if (!user) throw new Error("Invalid OTP");
    if (user.resetPasswordExpires.getTime() < Date.now())
      throw new Error("OTP expired");

    const hashedPassword = await hashpassword(newPassword);
    await userAdapter.updateUser?.(user._id.toString(), {
      password: hashedPassword,
      resetPasswordToken: "",
      resetPasswordExpires: new Date(0),
      refreshTokens: [],
    });

    return true;
  }

  static getUserFromToken(token: string) {
    const payload = TokenService.verifyToken<{ userId: string; jti: string }>(
      token,
      getAuthConfig().refreshToken.secret
    );
    if (!payload || !payload.userId)
      throw new Error("Invalid or expired token");
    return payload;
  }
}
