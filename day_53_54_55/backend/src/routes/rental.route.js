import express from "express";

import { protect } from "../components/middleware/auth.middleware.js";
import { authorize } from "../components/middleware/role.middleware.js";

import {
  create,
  getMyRentals,
  getRental,
  getRentals,
  changeRentalStatus,
  cancel,
} from "../controller/rental.controller.js";

const router = express.Router();

// CUSTOMER
// Create rental
router.post("/", protect, authorize("Customer"), create);

// Get logged-in customer's rentals
router.get("/my", protect, authorize("Customer"), getMyRentals);

// Cancel rental
// Customer + Staff + Admin
router.put(
  "/:id/cancel",
  protect,
  authorize("Customer", "Staff", "Admin"),
  cancel,
);

// ADMIN / STAFF
// Get all rentals
router.get("/", protect, authorize("Admin", "Staff"), getRentals);

// Update rental status
router.put(
  "/:id/status",
  protect,
  authorize("Admin", "Staff"),
  changeRentalStatus,
);

// SINGLE RENTAL
router.get("/:id", protect, authorize("Customer", "Staff", "Admin"), getRental);

export default router;
