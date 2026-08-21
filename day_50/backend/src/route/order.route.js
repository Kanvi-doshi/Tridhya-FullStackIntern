import express from "express";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  updateOrderStatus,
  getOrderAnalytics,
} from "../controller/order.controller.js";
import { updateOrderStatusSchema } from "../components/validation/order.validation.js";
import {
  protect,
  adminOnly,
} from "../components/middleware/auth.middleware.js";
import { validate } from "../components/middleware/validate.middleware.js";

const router = express.Router();

router.post("/", protect, createOrder);
router.get("/", protect, getMyOrders);
router.get("/analytics", protect, adminOnly, getOrderAnalytics);
router.get("/:id", protect, getOrderById);
router.patch("/:id/cancel", protect, cancelOrder);
router.patch(
  "/:id/status",
  protect,
  adminOnly,
  validate(updateOrderStatusSchema),
  updateOrderStatus,
);

export default router;
