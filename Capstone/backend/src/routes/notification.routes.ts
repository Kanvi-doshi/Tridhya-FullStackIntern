import { Router } from "express";
import {
  getMyNotifications,
  markNotificationRead,
  deleteMyNotification,
  clearMyNotifications,
} from "../controller/notification.controller";
import { protect } from "../lib/middleware/auth.middleware";

const router = Router();

router.get("/", protect, getMyNotifications);
router.delete("/", protect, clearMyNotifications);
router.patch("/:id/read", protect, markNotificationRead);
router.delete("/:id", protect, deleteMyNotification);

export default router;
