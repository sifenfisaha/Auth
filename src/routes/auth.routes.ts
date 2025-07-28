import { Router } from "express";
import {
  forgotPassword,
  login,
  logout,
  refreshToken,
  register,
  resetPassword,
  sendVerifyOtp,
  verifyEmail,
} from "../controllers/auth.controller";
import { registerSchema } from "../validations/signupSchema";
import { loginSchema } from "../validations/LoginSchema";

const router = Router();

router.post("/register", registerSchema, register);
router.post("/login", loginSchema, login);
router.post("/refresh", refreshToken);
router.post("/logout", logout);
router.get("/verify-email", sendVerifyOtp);
router.post("/verify-email", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
