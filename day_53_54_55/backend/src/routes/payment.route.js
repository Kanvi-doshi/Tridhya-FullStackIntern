import express from "express";

import { protect } from "../components/middleware/auth.middleware.js";
import { authorize } from "../components/middleware/role.middleware.js";

import {
  create,
  getMyPayments,
  getPayment,
  getPayments,
  changePaymentStatus,
} from "../controller/payment.controller.js";

const router = express.Router();

// CUSTOMER
// Create payment
router.post("/", protect, authorize("Customer"), create);

// Get logged-in customer's payments
router.get("/my", protect, authorize("Customer"), getMyPayments);

// ADMIN / STAFF
// Get all payments
router.get("/", protect, authorize("Admin", "Staff"), getPayments);

// Update payment status
router.put(
  "/:id/status",
  protect,
  authorize("Admin", "Staff"),
  changePaymentStatus,
);

// SINGLE PAYMENT
router.get(
  "/:id",
  protect,
  authorize("Customer", "Admin", "Staff"),
  getPayment,
);

export default router;
