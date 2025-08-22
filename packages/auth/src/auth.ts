import { Router } from "express";
import AuthRoutes from "./routes/auth.routes";
import {
  AuthConfig,
  JwtConfig,
  RefreshTokenConfig,
  RateLimitConfig,
} from "./types/config";
import { setAuthConfig } from "./configs/store";
import crypto from "crypto";

export const auth = <UserType = any>(
  config?: Partial<AuthConfig<UserType>>
) => {
  const defaultJwtSecret = crypto.randomBytes(32).toString("hex");
  const defaultRefreshSecret = crypto.randomBytes(32).toString("hex");

  // Typed defaults
  const defaultJwt: JwtConfig = {
    secret: defaultJwtSecret,
    algorithm: "HS256",
    expiresIn: "15m",
  };

  const defaultRefreshToken: RefreshTokenConfig = {
    secret: defaultRefreshSecret,
    expiresIn: "7d",
    rotation: "strict",
    reuseDetection: true,
  };

  const defaultRateLimit: RateLimitConfig = {
    windowMs: 60 * 60 * 1000,
    max: 5,
    blockDurationMs: 5 * 60 * 1000,
  };

  // Default config
  const defaultConfig: AuthConfig<UserType> = {
    basePath: "/api/auth",
    jwt: defaultJwt,
    refreshToken: defaultRefreshToken,
    userAdapter: {
      getUserById: async () => null,
      getUserByEmail: async () => null,
      createUser: async () => null as any,
      updateUser: async () => null,
      getUserByResetPasswordOtp: async () => null,
      getUserByVerificationOtp: async () => null,
      deleteUser: async () => null,
    },
    passwordPolicy: {
      minLength: 8,
      requireNumbers: true,
      requireSymbols: false,
      requireUppercase: false,
      requireLowercase: false,
      disallowCommonPasswords: true,
    },
    rateLimit: defaultRateLimit,
    session: {
      strategy: "jwt",
      cookieName: "sid",
      cookieSecure: true,
      cookieSameSite: "lax",
    },
    debug: false,
  };

  // Merge defaults with user config
  const mergedConfig: AuthConfig<UserType> = {
    ...defaultConfig,
    ...config,
    jwt: { ...defaultJwt, ...(config?.jwt || {}) },
    refreshToken: { ...defaultRefreshToken, ...(config?.refreshToken || {}) },
    passwordPolicy: {
      ...defaultConfig.passwordPolicy,
      ...(config?.passwordPolicy || {}),
    },
    rateLimit: { ...defaultRateLimit, ...(config?.rateLimit || {}) },
    session: { ...defaultConfig.session, ...(config?.session || {}) },
  };

  setAuthConfig(mergedConfig);

  const router = Router();
  router.use(mergedConfig.basePath!, AuthRoutes);

  return router;
};

export * from "./middlewares/auth.middleware";
