import express from "express";

import { updateProfile } from "../controller/user.controller.js";
import { protect } from "../components/middleware/auth.middleware.js";

const router = express.Router();

router.put("/me", protect, updateProfile);

export default router;
