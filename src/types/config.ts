export interface UserAdapter<UserType = any> {
  getUserById: (id: string) => Promise<UserType | null>;
  getUserByEmail: (email: string) => Promise<UserType | null>;
  createUser: (data: Record<string, any>) => Promise<UserType>;
  updateUser?: (
    id: string,
    data: Record<string, any>
  ) => Promise<UserType | null>;
  deleteUser?: (id: string) => Promise<boolean>;
}

export interface PasswordPolicy {
  minLength?: number;
  maxLength?: number;
  requireNumbers?: boolean;
  requireSymbols?: boolean;
  requireUppercase?: boolean;
  requireLowercase?: boolean;
  disallowCommonPasswords?: boolean;
}

export interface RateLimitConfig {
  windowMs: number;
  max: number;
  blockDurationMs?: number;
}

export interface JwtConfig {
  secret: string;
  expiresIn?: string;
  algorithm?: "HS256" | "HS384" | "HS512";
}

export interface RefreshTokenConfig {
  secret: string;
  expiresIn?: string;
  rotation?: "strict" | "lax";
  reuseDetection?: boolean;
}

export interface AuditConfig {
  enabled: boolean;
  provider?: "console" | "file" | "database" | "custom";
  onLog?: (event: { type: string; userId?: string; meta?: any }) => void;
}

export interface SessionConfig {
  strategy?: "jwt" | "cookie";
  cookieName?: string;
  cookieSecure?: boolean;
  cookieSameSite?: "strict" | "lax" | "none";
}

export interface AuthConfig<UserType = any> {
  basePath?: string;

  jwt: JwtConfig;
  refreshToken?: RefreshTokenConfig;

  userAdapter: UserAdapter<UserType>;

  providers?: Array<"google" | "github" | "facebook" | "custom">;
  passwordPolicy?: PasswordPolicy;

  rateLimit?: RateLimitConfig;
  auditLogs?: boolean | AuditConfig;

  session?: SessionConfig;

  debug?: boolean;

  onLogin?: (user: UserType, req?: any) => void;
  onRegister?: (user: UserType, req?: any) => void;
  onLogout?: (user: UserType, req?: any) => void;
  onTokenRefresh?: (user: UserType, req?: any) => void;
  errorHandler?: (err: any, req: any, res: any, next: any) => void;
}
