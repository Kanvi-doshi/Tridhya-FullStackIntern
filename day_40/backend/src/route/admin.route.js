import express from "express";

import {
  allUsers,
  changeUserRole,
  removeUser,
  allEvents,
  removeEvent,
  adminStats,
} from "../controller/admin.controller.js";

import { protect } from "../components/middleware/auth.middleware.js";
import { authorize } from "../components/middleware/role.middleware.js";

const router = express.Router();

router.use(protect);
router.use(authorize("admin"));
router.get("/stats", adminStats);
router.get("/users", allUsers);
router.put("/users/:id/role", changeUserRole);
router.delete("/users/:id", removeUser);
router.get("/events", allEvents);
router.delete("/events/:id", removeEvent);

export default router;
