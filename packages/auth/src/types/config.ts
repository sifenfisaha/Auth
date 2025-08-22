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
  expiresIn: "15m" | "30m" | "1h" | "2h" | "7d";
  algorithm?: "HS256" | "HS384" | "HS512";
}

export interface RefreshTokenConfig {
  secret: string;
  expiresIn: "7d" | "14d" | "30d" | "60d";
  rotation?: "strict" | "lax";
  reuseDetection?: boolean;
}

export interface SessionConfig {
  strategy?: "jwt" | "cookie";
  cookieName?: string;
  cookieSecure?: boolean;
  cookieSameSite?: "strict" | "lax" | "none";
}

export interface SmtpOptions {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export type EmailTransport = "smpt" | "console";

export interface EmailTemplates {
  verification?: (ctx: { user: any; otp: string; req: any }) => {
    subject: string;
    html: string;
    text: string;
  };
  passwordReset?: (ctx: { user: any; otp: string; req?: any }) => {
    subject: string;
    html: string;
    text?: string;
  };
}

export interface EmailConfig {
  enabled?: boolean;
  transport: EmailTransport;
  from: string;
  stmp?: SmtpOptions;
  templates?: EmailTemplates;
}

export interface AuthConfig<UserType = any> {
  basePath?: string;

  jwt: JwtConfig;
  refreshToken: RefreshTokenConfig;

  userAdapter: UserAdapter<UserType>;

  providers?: Array<"google" | "github" | "facebook" | "custom">;
  passwordPolicy?: PasswordPolicy;

  rateLimit?: RateLimitConfig;

  session?: SessionConfig;
  email?: EmailConfig;

  debug?: boolean;

  onLogin?: (user: UserType, req?: any) => void;
  onRegister?: (user: UserType, req?: any) => void;
  onLogout?: (user: UserType, req?: any) => void;
  onTokenRefresh?: (user: UserType, req?: any) => void;
  errorHandler?: (err: any, req: any, res: any, next: any) => void;
}
