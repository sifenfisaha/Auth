import { Router } from "express";
import {
  register,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  requestVerification,
  confirmVerification,
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
router.post(
  "/verify-email/request",
  verifyEmailSchema,
  validateRequest,
  requestVerification
);
router.post(
  "/verify-email/confirm",
  otpSchema,
  validateRequest,
  confirmVerification
);
router.post(
  "/forgot-password",
  verifyEmailSchema,
  validateRequest,
  forgotPassword
);
router.post("/reset-password", otpSchema, validateRequest, resetPassword);

export default router;
