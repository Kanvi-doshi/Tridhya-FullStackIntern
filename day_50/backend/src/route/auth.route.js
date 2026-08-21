import express from "express";
import {
  register,
  login,
  updateProfile,
} from "../controller/auth.controller.js";
import { validate } from "../components/middleware/validate.middleware.js";

import {
  registerSchema,
  loginSchema,
} from "../components/validation/auth.validation.js";
import { protect } from "../components/middleware/auth.middleware.js";
const router = express.Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.put("/profile", protect, updateProfile);

export default router;
