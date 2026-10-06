import { Router } from "express";
import {
  register,
  login,
  getMe,
  updateProfile,
  refreshToken,
  logout,
} from "../controller/auth.controller";
import { validate } from "../lib/middleware/validate.middleware";
import { protect } from "../lib/middleware/auth.middleware";
import {
  loginSchema,
  registerSchema,
  updateProfileSchema,
} from "../lib/validation/auth.validation";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.get("/me", protect, getMe);
router.patch("/me", protect, validate(updateProfileSchema), updateProfile);
router.post("/refresh", refreshToken);
router.post("/logout", logout);

export default router;
