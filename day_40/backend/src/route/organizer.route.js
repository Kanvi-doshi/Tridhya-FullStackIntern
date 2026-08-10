import express from "express";

import {
  organizerDashboard,
  organizerEvents,
} from "../controller/organizer.controller.js";

import { protect } from "../components/middleware/auth.middleware.js";
import { authorize } from "../components/middleware/role.middleware.js";

const router = express.Router();

router.get(
  "/dashboard",
  protect,
  authorize("organizer", "admin"),
  organizerDashboard,
);

router.get(
  "/events",
  protect,
  authorize("organizer", "admin"),
  organizerEvents,
);

export default router;
