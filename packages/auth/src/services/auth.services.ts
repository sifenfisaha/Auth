import { TokenService } from "./token.service";
import { comparePassword, hashpassword } from "../utils/bcrypt";
import {
  sendVerificationOtp,
  sendResetOtp,
} from "../utils/sendVerificationEmail";
import { getAuthConfig } from "../configs/store";
import { generateOtp } from "../utils/otp";
import { EmailService } from "./email.service";

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
  static async requestVerification(email: string) {
    const { userAdapter } = getAuthConfig();
    const user = await userAdapter.getUserByEmail(email);
    if (!user) throw new Error("User not found");

    const otp = generateOtp();

    await userAdapter.updateUser(user._id, {
      verificationToken: otp,
      verificationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    const tamplate = EmailService.renderVerificationTemplate(user, otp);

    await EmailService.send({ to: user.email, ...tamplate });
    return { message: "Verification code sent" };
  }
  static async confirmVerification(otp: string) {
    const { userAdapter } = getAuthConfig();
    const user = await userAdapter.getUserByVerificationOtp(otp);
    if (!user) throw new Error("Invalid or expired code");

    await userAdapter.updateUser(user._id, {
      isVerified: true,
      verificationToken: null,
      verificationTokenExpires: null,
    });

    return { message: "Email verified successfully" };
  }
}
