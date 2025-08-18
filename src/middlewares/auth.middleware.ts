import { Request, Response, NextFunction, RequestHandler } from "express";
import User from "../models/user.model";
import { TokenService } from "../services/token.service";

export const isAuthenticated = (
  options: { optional?: boolean } = {}
): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log("hi");
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
        jti?: string;
      }>(token, process.env.JWT_SECRET!);

      if (!payload?.userId) {
        if (options.optional) return next();
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized: Invalid token" });
      }

      // Attach user info to req.user
      req.user = { id: payload.userId };

      next();
    } catch (err) {
      if (options.optional) return next();
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: Invalid token" });
    }
  };
};

export const isAuthorized = (requiredRole: string): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized: No user found" });
      }

      const user = await User.findById(req.user.id);
      if (!user) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized: User not found" });
      }

      if (user.role !== requiredRole) {
        return res
          .status(403)
          .json({ success: false, message: "Forbidden: Access denied" });
      }

      next();
    } catch (err: any) {
      res
        .status(500)
        .json({ success: false, message: err.message || "Server error" });
    }
  };
};
