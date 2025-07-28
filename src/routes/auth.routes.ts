import { Router } from "express";
import {
  login,
  logout,
  refreshToken,
  register,
  sendVerifyOtp,
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
router.get("/verify-email", sendVerifyOtp);
router.post("/verify-email", verifyEmail);

export default router;
