import { Request, Response, NextFunction, RequestHandler } from "express";
import { getAuthConfig } from "../configs/store";
import { TokenService } from "../services/token.service";

interface AuthGuardOptions {
  optional?: boolean;
  roles?: string[];
}

export const authGuard = (options: AuthGuardOptions = {}): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const config = getAuthConfig();

    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        if (options.optional) return next();
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized: No token provided" });
      }

      const token = authHeader.split(" ")[1];

      const payload = TokenService.verifyToken<{
        userId: string;
        role?: string;
        jti?: string;
      }>(token, config.jwt.secret);

      if (!payload?.userId) {
        if (options.optional) return next();
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized: Invalid token" });
      }

      const user = await config.userAdapter.getUserById(payload.userId);
      if (!user) {
        if (options.optional) return next();
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized: User not found" });
      }

      req.user = {
        id: payload.userId,
        role: user.role,
        ...user,
      };

      if (options.roles && !options.roles.includes(user.role)) {
        return res
          .status(403)
          .json({ success: false, message: "Forbidden: Access denied" });
      }

      return next();
    } catch (err: any) {
      if (options.optional) return next();
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized", error: err.message });
    }
  };
};
