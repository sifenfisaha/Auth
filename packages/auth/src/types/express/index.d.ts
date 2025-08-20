import "express-serve-static-core";

declare module "express-serve-static-core" {
  interface Request {
    data?: Record<string, any>;

    user?: {
      id: string;
      email?: string;
      username?: string;
      roles?: string[];
      isAdmin?: boolean;
    };

    token?: string;
  }
}
