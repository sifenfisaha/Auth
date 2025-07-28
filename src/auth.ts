import { Router } from "express";
import AuthRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";

export const auth = (basePath = "/api/auth") => {
  const router = Router();
  router.use(basePath, AuthRoutes);
  return router;
};

export const user = (basePath = "/api/user") => {
  const router = Router();
  router.use(basePath, userRoutes);
  return router;
};

export * from "./middlewares/auth.middleware";
export * from "./utils/jwt";
