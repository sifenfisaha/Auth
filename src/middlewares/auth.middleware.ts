import type { NextFunction, Response } from "express";
import type { AuthenticatedRequest } from "../types/types";
import { verifyAccessToken } from "../utils/jwt";

const createIsAuthenticated =
  (options: { optional?: boolean } = {}) =>
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      if (options.optional) return next();
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }
    const token = authHeader.split(" ")[1];
    const payload = verifyAccessToken(token);
    if (!payload) {
      if (options.optional) return next();
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
    req.user = {
      id: payload.id,
      role: payload.role,
    };
    next();
  };

export const isAuthenticated = Object.assign(createIsAuthenticated(), {
  optional: createIsAuthenticated({ optional: true }),
  required: createIsAuthenticated({ optional: false }),
});

export const isAuthorized = (...allowedRoles: string[]) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized: No user found" });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: Access denied" });
    }
    next();
  };
};
