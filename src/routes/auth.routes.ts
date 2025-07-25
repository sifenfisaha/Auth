import { Router } from "express";
import {
  login,
  logout,
  refreshToken,
  register,
} from "../controllers/auth.controller";
import { registerSchema } from "../validations/signupSchema";
import { loginSchema } from "../validations/LoginSchema";

const router = Router();

router.post("/register", registerSchema, register);
router.post("/login", loginSchema, login);
router.post("/refresh", refreshToken);
router.post("/logout", logout);

export default router;
