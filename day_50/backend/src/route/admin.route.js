import express from "express";

import {
  getAdminUsers,
  addAdminUser,
  updateUserRole,
  deleteAdminUser,
  getAdminOrders,
  getAdminOrderById,
  updateOrderStatus,
} from "../controller/admin.controller.js";

import {
  protect,
  adminOnly,
} from "../components/middleware/auth.middleware.js";

const router = express.Router();

// USERS
router.get("/users", protect, adminOnly, getAdminUsers);
router.post("/users", protect, adminOnly, addAdminUser);
router.patch("/users/:id/role", protect, adminOnly, updateUserRole);
router.delete("/users/:id", protect, adminOnly, deleteAdminUser);

// ORDERS
router.get("/orders", protect, adminOnly, getAdminOrders);
router.get("/orders/:id", protect, adminOnly, getAdminOrderById);
router.patch("/orders/:id/status", protect, adminOnly, updateOrderStatus);

export default router;
