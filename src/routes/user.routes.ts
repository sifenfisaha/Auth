import { Router } from "express";
import { isAuthenticated } from "../middlewares/auth.middleware";
import {
  getUserProfile,
  updateUserProfile,
} from "../controllers/user.controlller";

const router = Router();

router.get("/profile", isAuthenticated, getUserProfile);
router.put("/profile", isAuthenticated, updateUserProfile);

export default router;
