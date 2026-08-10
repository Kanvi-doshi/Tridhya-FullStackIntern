import express from "express";
import {
  register,
  login,
  getProfile,
  updateProfile,
  deleteProfile,
} from "../controller/auth.controller.js";
import { protect } from "../components/middleware/auth.middleware.js";
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
} from "../validation/auth.validation.js";

const router = express.Router();

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      errors: result.error.flatten().fieldErrors,
    });
  }

  req.body = result.data;

  next();
};

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, validate(updateProfileSchema), updateProfile);
router.delete("/profile", protect, deleteProfile);

export default router;
