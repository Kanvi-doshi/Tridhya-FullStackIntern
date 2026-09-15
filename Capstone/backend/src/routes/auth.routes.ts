import { Router } from "express";

import { register, login, getMe } from "../controller/auth.controller";
import { validate } from "../lib/middleware/validate.middleware";
import { protect } from "../lib/middleware/auth.middleware";
import { loginSchema, registerSchema } from "../lib/validation/auth.validation";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.get("/me", protect, getMe);

export default router;
