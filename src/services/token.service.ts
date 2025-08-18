import jwt from "jsonwebtoken";
import { v4 as uuid } from "uuid";
import User from "../models/user.model";

interface TokenPayload {
  userId: string;
  jti: string;
}

export class TokenService {
  static generateAccessToken(payload: TokenPayload) {
    const jti = uuid();
    return jwt.sign({ ...payload, jti }, process.env.JWT_SECRET!, {
      expiresIn: "15m",
    });
  }

  static async generateRefreshToken(userId: string) {
    const jti = uuid();
    const token = jwt.sign({ userId, jti }, process.env.REFRESH_SECRET!, {
      expiresIn: "7d",
    });

    const user = await User.findById(userId);

    if (!user) throw new Error("User not found");

    user.refreshTokens.push(jti);
    await user.save();

    return token;
  }

  static verifyToken<T extends object = any>(
    token: string,
    secret: string
  ): T | null {
    try {
      return jwt.verify(token, secret) as T;
    } catch (error) {
      return null;
    }
  }

  static async isRefreshTokenValid(
    jti: string,
    userId: string
  ): Promise<Boolean> {
    const user = await User.findById(userId);
    if (!user) return false;
    return user.refreshTokens.includes(jti);
  }

  static async invalidateRefreshToken(
    jti: string,
    userId: string
  ): Promise<void> {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    user.refreshTokens = user.refreshTokens.filter((t) => t !== jti);
    await user.save();
  }

  static async rotateRefreshToken(
    oldJti: string,
    userId: string
  ): Promise<string> {
    const jti = uuid();
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    user.refreshTokens = user.refreshTokens.filter((t) => t !== oldJti);

    await user.save();

    return jwt.sign({ userId, jti }, process.env.REFRESH_SECRET!, {
      expiresIn: "7d",
    });
  }
}
