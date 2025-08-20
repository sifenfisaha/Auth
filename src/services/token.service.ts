import jwt from "jsonwebtoken";
import { v4 as uuid } from "uuid";
import { getAuthConfig } from "../configs/store";

interface TokenPayload {
  userId: string;
  jti?: string;
}

export class TokenService {
  static generateAccessToken(payload: TokenPayload) {
    const config = getAuthConfig();
    const jti = uuid();
    return jwt.sign({ ...payload, jti }, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
      algorithm: config.jwt.algorithm,
    });
  }

  static async generateRefreshToken(userId: string) {
    const config = getAuthConfig();
    if (!config.refreshToken) {
      throw new Error("Refresh token config is missing");
    }

    const jti = uuid();
    const token = jwt.sign({ userId, jti }, config.refreshToken.secret, {
      expiresIn: config.refreshToken.expiresIn,
    });

    const user = await config.userAdapter.getUserById(userId);
    if (!user) throw new Error("User not found");

    const updatedTokens = [...(user.refreshTokens || []), jti];
    await config.userAdapter.updateUser?.(userId, {
      refreshTokens: updatedTokens,
    });

    return token;
  }

  static verifyToken<T extends object = any>(
    token: string,
    secret: string
  ): T | null {
    try {
      return jwt.verify(token, secret) as T;
    } catch {
      return null;
    }
  }

  static async isRefreshTokenValid(
    jti: string,
    userId: string
  ): Promise<boolean> {
    const config = getAuthConfig();
    const user = await config.userAdapter.getUserById(userId);
    if (!user) return false;
    return (user.refreshTokens || []).includes(jti);
  }

  static async invalidateRefreshToken(
    jti: string,
    userId: string
  ): Promise<void> {
    const config = getAuthConfig();
    const user = await config.userAdapter.getUserById(userId);
    if (!user) throw new Error("User not found");

    const updatedTokens = (user.refreshTokens || []).filter(
      (t: any) => t !== jti
    );
    await config.userAdapter.updateUser?.(userId, {
      refreshTokens: updatedTokens,
    });
  }

  static async rotateRefreshToken(
    oldJti: string,
    userId: string
  ): Promise<string> {
    const config = getAuthConfig();
    if (!config.refreshToken) {
      throw new Error("Refresh token config is missing");
    }

    const jti = uuid();
    const user = await config.userAdapter.getUserById(userId);
    if (!user) throw new Error("User not found");

    const updatedTokens = (user.refreshTokens || []).filter(
      (t: any) => t !== oldJti
    );
    updatedTokens.push(jti);

    await config.userAdapter.updateUser?.(userId, {
      refreshTokens: updatedTokens,
    });

    return jwt.sign({ userId, jti }, config.refreshToken.secret, {
      expiresIn: config.refreshToken.expiresIn,
    });
  }
}
