import { Router } from "express";
import {
  login,
  logout,
  refreshToken,
  register,
  verifyEmail,
} from "../controllers/auth.controller";
import { registerSchema } from "../validations/signupSchema";
import { loginSchema } from "../validations/LoginSchema";
import { Request, Response } from "express";

const router = Router();

router.post("/register", registerSchema, register);
router.post("/login", loginSchema, login);
router.post("/refresh", refreshToken);
router.post("/logout", logout);
router.get("/verify-email", verifyEmail);
router.get("/wkanda", (req: Request, res: Response) => {
  return res.sendStatus(200);
});

export default router;
