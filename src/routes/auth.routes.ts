import { Router } from "express";
import {
  register,
  login,
  refreshToken,
  logout,
  sendVerifyOtp,
  verifyEmail,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller";
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  otpSchema,
} from "../validators/validationSchemas";
import { validateRequest } from "../validators/validateRequest";

const router = Router();

router.post("/singup", registerSchema, validateRequest, register);
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
router.post("/reset-password", otpSchema, validateRequest, resetPassword);

export default router;
