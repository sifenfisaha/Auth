import { Router } from "express";
import AuthRoutes from "./routes/auth.routes";
import {
  AuthConfig,
  JwtConfig,
  RefreshTokenConfig,
  RateLimitConfig,
} from "./types/config";
import { setAuthConfig } from "./configs/store";
import { jsonUserAdapter } from "./db/json.adapter";

export const auth = <UserType = any>(
  config?: Partial<AuthConfig<UserType>> & { devMode?: boolean }
) => {
  if (config?.devMode) {
    console.warn("[auth] Running in devMode. Using local JSON DB.");
    config.userAdapter = jsonUserAdapter as any;
    config.jwt = { secret: "dev-secret", expiresIn: "1h" };
    config.refreshToken = { secret: "dev-refresh", expiresIn: "7d" };
    config.email = {
      enabled: false,
      from: "dev@example.com",
      transport: "console",
    };
  }
  const defaultJwtSecret = "dev-secret";
  const defaultRefreshSecret = "dev-refresh";

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
