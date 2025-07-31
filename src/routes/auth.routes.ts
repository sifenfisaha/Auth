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
  otpSchema,
} from "../validators/validationSchemas";
import { validateRequest } from "../validators/validateRequest";

const router = Router();

router.post("/register", registerSchema, validateRequest, register);
router.post("/login", loginSchema, validateRequest, login);
router.post("/refresh", refreshToken);
router.post("/logout", logout);
router.get("/verify-email", sendVerifyOtp);
router.post("/verify-email", otpSchema, validateRequest, verifyEmail);
router.post(
  "/forgot-password",
  verifyEmailSchema,
  validateRequest,
  forgotPassword
);
router.post("/reset-password", verifyOtpSchema, validateRequest, resetPassword);

export default router;
