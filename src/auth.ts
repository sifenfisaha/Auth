import { Router } from "express";
import AuthRoutes from "./routes/auth.routes";

export const auth = (basePath = "/api/auth") => {
  const router = Router();
  router.use(basePath, AuthRoutes);
  return router;
};

export * from "./middlewares/auth.middleware";
export * from "./utils/jwt";
