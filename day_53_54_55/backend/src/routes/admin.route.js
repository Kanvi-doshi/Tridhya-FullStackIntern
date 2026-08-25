import express from "express";

import { protect } from "../components/middleware/auth.middleware.js";
import { authorize } from "../components/middleware/role.middleware.js";

import {
  getUsers,
  getUser,
  changeUserRole,
  removeUser,
  getDashboard,
  getAnalytics,
} from "../controller/admin.controller.js";

const router = express.Router();

router.get("/users", protect, authorize("Admin"), getUsers);
router.get("/users/:id", protect, authorize("Admin"), getUser);
router.put("/users/:id/role", protect, authorize("Admin"), changeUserRole);
router.delete("/users/:id", protect, authorize("Admin"), removeUser);

router.get("/dashboard", protect, authorize("Admin"), getDashboard);
router.get("/analytics", protect, authorize("Admin"), getAnalytics);

export default router;
