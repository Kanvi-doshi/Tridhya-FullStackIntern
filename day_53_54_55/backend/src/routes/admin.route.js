import express from "express";

import { protect } from "../components/middleware/auth.middleware.js";
import { authorize } from "../components/middleware/role.middleware.js";

import {
  getUsers,
  getUser,
  changeUserRole,
  removeUser,
} from "../controller/admin.controller.js";

const router = express.Router();

router.get("/users", protect, authorize("Admin"), getUsers);
router.get("/users/:id", protect, authorize("Admin"), getUser);
router.put("/users/:id/role", protect, authorize("Admin"), changeUserRole);
router.delete("/users/:id", protect, authorize("Admin"), removeUser);

export default router;
