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
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  verifyOtpSchema,
} from "../validations/validationSchemas";

const router = Router();

router.post("/register", registerSchema, register);
router.post("/login", loginSchema, login);
router.post("/refresh", refreshToken);
router.post("/logout", logout);
router.get("/verify-email", sendVerifyOtp);
router.post("/verify-email", verifyEmail);
router.post("/forgot-password", verifyEmailSchema, forgotPassword);
router.post("/reset-password", verifyOtpSchema, resetPassword);

export default router;
